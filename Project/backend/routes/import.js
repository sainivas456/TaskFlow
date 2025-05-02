
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// @route   POST api/import/tasks
// @desc    Import tasks
// @access  Private
router.post('/tasks', auth, async (req, res) => {
  try {
    const db = req.db;
    const tasks = req.body.tasks;
    
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ message: 'Invalid data format. Expected tasks array.' });
    }
    
    const results = [];
    
    // Process each task
    for (const task of tasks) {
      // Validation
      if (!task.title) {
        results.push({ 
          success: false, 
          task: task,
          message: 'Title is required' 
        });
        continue;
      }
      
      try {
        // Insert task
        const newTask = await db.query(
          'INSERT INTO Tasks (user_id, title, description, due_date, priority, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
          [
            req.user.id, 
            task.title, 
            task.description || null, 
            task.due_date || null, 
            task.priority || 0, 
            task.status || 'Pending'
          ]
        );
        
        results.push({ 
          success: true, 
          task: newTask.rows[0] 
        });
      } catch (insertError) {
        results.push({ 
          success: false, 
          task: task, 
          message: insertError.message 
        });
      }
    }
    
    res.status(201).json({
      message: 'Import process completed',
      totalProcessed: tasks.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results: results
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/import/labels
// @desc    Import labels
// @access  Private
router.post('/labels', auth, async (req, res) => {
  try {
    const db = req.db;
    const labels = req.body.labels;
    
    if (!Array.isArray(labels)) {
      return res.status(400).json({ message: 'Invalid data format. Expected labels array.' });
    }
    
    const results = [];
    
    // Process each label
    for (const label of labels) {
      // Validation
      if (!label.name || !label.color) {
        results.push({ 
          success: false, 
          label: label,
          message: 'Name and color are required' 
        });
        continue;
      }
      
      try {
        // Insert label
        const newLabel = await db.query(
          'INSERT INTO Labels (user_id, name, color, description) VALUES ($1, $2, $3, $4) RETURNING *',
          [
            req.user.id, 
            label.name, 
            label.color,
            label.description || null
          ]
        );
        
        results.push({ 
          success: true, 
          label: newLabel.rows[0] 
        });
      } catch (insertError) {
        results.push({ 
          success: false, 
          label: label, 
          message: insertError.message 
        });
      }
    }
    
    res.status(201).json({
      message: 'Import process completed',
      totalProcessed: labels.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results: results
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
