
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

// @route   GET api/labels
// @desc    Get all labels for the current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const db = req.db;
    
    const labels = await db.query(
      'SELECT * FROM Labels WHERE user_id = $1',
      [req.user.id]
    );
    
    res.json(labels.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/labels
// @desc    Create a new label
// @access  Private
router.post('/', [
  auth,
  [
    check('name', 'Name is required').not().isEmpty(),
    check('color', 'Color is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { name, color, description } = req.body;
  
  try {
    const db = req.db;
    
    const newLabel = await db.query(
      'INSERT INTO Labels (user_id, name, color, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, name, color, description]
    );
    
    res.status(201).json(newLabel.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/labels/:id
// @desc    Update a label
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, color, description } = req.body;
  
  try {
    const db = req.db;
    
    // Check if label exists and belongs to user
    let label = await db.query(
      'SELECT * FROM Labels WHERE label_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (label.rows.length === 0) {
      return res.status(404).json({ message: 'Label not found or not authorized' });
    }
    
    // Update label
    const updatedLabel = await db.query(
      'UPDATE Labels SET name = $1, color = $2, description = $3 WHERE label_id = $4 AND user_id = $5 RETURNING *',
      [
        name || label.rows[0].name,
        color || label.rows[0].color,
        description !== undefined ? description : label.rows[0].description,
        req.params.id,
        req.user.id
      ]
    );
    
    res.json(updatedLabel.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/labels/:id
// @desc    Delete a label
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const db = req.db;
    
    // Check if label exists and belongs to user
    let label = await db.query(
      'SELECT * FROM Labels WHERE label_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (label.rows.length === 0) {
      return res.status(404).json({ message: 'Label not found or not authorized' });
    }
    
    // Delete label
    await db.query(
      'DELETE FROM Labels WHERE label_id = $1',
      [req.params.id]
    );
    
    res.json({ message: 'Label deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
