
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

// @route   GET api/tasks
// @desc    Get all tasks for the current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const db = req.db;
    
    const tasks = await db.query(
      'SELECT * FROM Tasks WHERE user_id = $1 ORDER BY due_date ASC',
      [req.user.id]
    );
    
    res.json(tasks.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const db = req.db;
    
    const task = await db.query(
      'SELECT * FROM Tasks WHERE task_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (task.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', [
  auth,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('priority', 'Priority must be a number').isNumeric(),
    check('status', 'Status is required').isIn(['Pending', 'In Progress', 'Completed', 'Overdue']),
  ]
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { title, description, due_date, priority, status } = req.body;
  
  try {
    const db = req.db;
    
    const newTask = await db.query(
      'INSERT INTO Tasks (user_id, title, description, due_date, priority, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
      [req.user.id, title, description, due_date, priority, status]
    );
    
    res.status(201).json(newTask.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { title, description, due_date, priority, status } = req.body;
  
  // Build task object
  const taskFields = {};
  if (title !== undefined) taskFields.title = title;
  if (description !== undefined) taskFields.description = description;
  if (due_date !== undefined) taskFields.due_date = due_date;
  if (priority !== undefined) taskFields.priority = priority;
  if (status !== undefined) taskFields.status = status;
  
  try {
    const db = req.db;
    
    // Check if task exists and belongs to user
    let task = await db.query(
      'SELECT * FROM Tasks WHERE task_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (task.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }
    
    // Update task
    const fieldsToUpdate = Object.keys(taskFields);
    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    const setQuery = fieldsToUpdate.map((field, i) => `${field} = $${i + 3}`).join(', ');
    const values = fieldsToUpdate.map(field => taskFields[field]);
    
    const updatedTask = await db.query(
      `UPDATE Tasks SET ${setQuery} WHERE task_id = $1 AND user_id = $2 RETURNING *`,
      [req.params.id, req.user.id, ...values]
    );
    
    res.json(updatedTask.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const db = req.db;
    
    // Check if task exists and belongs to user
    let task = await db.query(
      'SELECT * FROM Tasks WHERE task_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (task.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }
    
    // Delete task
    await db.query(
      'DELETE FROM Tasks WHERE task_id = $1',
      [req.params.id]
    );
    
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/tasks/:id/complete
// @desc    Mark task as completed
// @access  Private
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const db = req.db;
    
    // Check if task exists and belongs to user
    let task = await db.query(
      'SELECT * FROM Tasks WHERE task_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (task.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }
    
    // Update task to completed
    const updatedTask = await db.query(
      'UPDATE Tasks SET status = $1, completed_at = NOW() WHERE task_id = $2 RETURNING *',
      ['Completed', req.params.id]
    );
    
    res.json(updatedTask.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
