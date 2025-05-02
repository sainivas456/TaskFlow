
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

// @route   GET api/time-tracking
// @desc    Get all time entries for the current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const db = req.db;
    
    const timeEntries = await db.query(
      `SELECT te.*, t.title as task_title 
       FROM Time_Entries te
       LEFT JOIN Tasks t ON te.task_id = t.task_id
       WHERE te.user_id = $1
       ORDER BY te.start_time DESC`,
      [req.user.id]
    );
    
    res.json(timeEntries.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/time-tracking/:taskId
// @desc    Get time entries for a specific task
// @access  Private
router.get('/task/:taskId', auth, async (req, res) => {
  try {
    const db = req.db;
    
    const timeEntries = await db.query(
      `SELECT te.*, t.title as task_title 
       FROM Time_Entries te
       LEFT JOIN Tasks t ON te.task_id = t.task_id
       WHERE te.task_id = $1 AND te.user_id = $2
       ORDER BY te.start_time DESC`,
      [req.params.taskId, req.user.id]
    );
    
    res.json(timeEntries.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/time-tracking
// @desc    Create a new time entry
// @access  Private
router.post('/', [
  auth,
  [
    check('task_id', 'Task ID is required').not().isEmpty(),
    check('start_time', 'Start time is required').not().isEmpty(),
    check('duration_minutes', 'Duration is required').isNumeric()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { task_id, start_time, end_time, duration_minutes, description } = req.body;
  
  try {
    const db = req.db;
    
    // Verify task belongs to user
    const task = await db.query(
      'SELECT * FROM Tasks WHERE task_id = $1 AND user_id = $2',
      [task_id, req.user.id]
    );
    
    if (task.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }
    
    const newTimeEntry = await db.query(
      'INSERT INTO Time_Entries (user_id, task_id, start_time, end_time, duration_minutes, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, task_id, start_time, end_time, duration_minutes, description]
    );
    
    res.status(201).json(newTimeEntry.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/time-tracking/:id
// @desc    Update a time entry
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { start_time, end_time, duration_minutes, description } = req.body;
  
  try {
    const db = req.db;
    
    // Check if time entry exists and belongs to user
    let timeEntry = await db.query(
      'SELECT * FROM Time_Entries WHERE entry_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (timeEntry.rows.length === 0) {
      return res.status(404).json({ message: 'Time entry not found or not authorized' });
    }
    
    // Update time entry
    const updatedTimeEntry = await db.query(
      'UPDATE Time_Entries SET start_time = $1, end_time = $2, duration_minutes = $3, description = $4 WHERE entry_id = $5 AND user_id = $6 RETURNING *',
      [
        start_time || timeEntry.rows[0].start_time,
        end_time !== undefined ? end_time : timeEntry.rows[0].end_time,
        duration_minutes || timeEntry.rows[0].duration_minutes,
        description !== undefined ? description : timeEntry.rows[0].description,
        req.params.id,
        req.user.id
      ]
    );
    
    res.json(updatedTimeEntry.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/time-tracking/:id
// @desc    Delete a time entry
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const db = req.db;
    
    // Check if time entry exists and belongs to user
    let timeEntry = await db.query(
      'SELECT * FROM Time_Entries WHERE entry_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (timeEntry.rows.length === 0) {
      return res.status(404).json({ message: 'Time entry not found or not authorized' });
    }
    
    // Delete time entry
    await db.query(
      'DELETE FROM Time_Entries WHERE entry_id = $1',
      [req.params.id]
    );
    
    res.json({ message: 'Time entry deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
