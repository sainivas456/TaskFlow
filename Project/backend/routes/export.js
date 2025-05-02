
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// @route   GET api/export/tasks
// @desc    Export all tasks for the current user
// @access  Private
router.get('/tasks', auth, async (req, res) => {
  try {
    const db = req.db;
    const format = req.query.format || 'json';
    
    const tasks = await db.query(
      'SELECT * FROM Tasks WHERE user_id = $1 ORDER BY due_date ASC',
      [req.user.id]
    );
    
    switch (format.toLowerCase()) {
      case 'json':
        res.json(tasks.rows);
        break;
        
      case 'csv':
        // Simple CSV conversion (in production would use a csv library)
        if (tasks.rows.length === 0) {
          return res.send('No data');
        }
        
        const headers = Object.keys(tasks.rows[0]).join(',');
        const csvData = tasks.rows.map(row => 
          Object.values(row).map(value => 
            `"${value === null ? '' : value.toString().replace(/"/g, '""')}"`
          ).join(',')
        ).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="tasks.csv"');
        res.send(`${headers}\n${csvData}`);
        break;
      
      default:
        res.status(400).json({ message: 'Unsupported format' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/export/time-entries
// @desc    Export all time entries for the current user
// @access  Private
router.get('/time-entries', auth, async (req, res) => {
  try {
    const db = req.db;
    const format = req.query.format || 'json';
    
    const timeEntries = await db.query(
      `SELECT te.*, t.title as task_title 
       FROM Time_Entries te
       LEFT JOIN Tasks t ON te.task_id = t.task_id
       WHERE te.user_id = $1
       ORDER BY te.start_time DESC`,
      [req.user.id]
    );
    
    // Format handling same as tasks export
    res.json(timeEntries.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/export/all
// @desc    Export all user data
// @access  Private
router.get('/all', auth, async (req, res) => {
  try {
    const db = req.db;
    
    // Get all user data
    const tasks = await db.query('SELECT * FROM Tasks WHERE user_id = $1', [req.user.id]);
    const labels = await db.query('SELECT * FROM Labels WHERE user_id = $1', [req.user.id]);
    const timeEntries = await db.query('SELECT * FROM Time_Entries WHERE user_id = $1', [req.user.id]);
    
    // Build export object
    const exportData = {
      tasks: tasks.rows,
      labels: labels.rows,
      timeEntries: timeEntries.rows
    };
    
    res.json(exportData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
