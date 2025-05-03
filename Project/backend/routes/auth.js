const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', [
  check('username', 'Username is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;
  
  try {
    const db = req.db;
    
    // Check if user already exists
    const userExists = await db.query(
      'SELECT * FROM Users WHERE email = $1',
      [email]
    );
    
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = await db.query(
      'INSERT INTO Users (username, email, password_hash, created_at) VALUES ($1, $2, $3, NOW()) RETURNING user_id, username, email, created_at',
      [username, email, hashedPassword]
    );
    
    // Create JWT
    const payload = {
      user: {
        id: newUser.rows[0].user_id
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
      (err, token) => {
        if (err) throw err;
        res.json({
          user: newUser.rows[0],
          token
        });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  
  try {
    const db = req.db;
    
    // Check for user
    const result = await db.query(
      'SELECT * FROM Users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // User matched - create JWT
    const payload = {
      user: {
        id: user.user_id
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
      (err, token) => {
        if (err) throw err;
        
        // Remove password hash from response
        const { password_hash, ...userData } = user;
        
        res.json({
          user: userData,
          token
        });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const db = req.db;
    
    const result = await db.query(
      'SELECT user_id, username, email, created_at FROM Users WHERE user_id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', [
  auth,
  [
    check('currentPassword', 'Current password is required').exists(),
    check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
  ]
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;
  
  try {
    const db = req.db;
    
    // Get user from database
    const result = await db.query(
      'SELECT * FROM Users WHERE user_id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = result.rows[0];
    
    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password in database
    await db.query(
      'UPDATE Users SET password_hash = $1 WHERE user_id = $2',
      [hashedPassword, req.user.id]
    );
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
