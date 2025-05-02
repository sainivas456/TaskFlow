
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
    
    // Get tasks
    const tasks = await db.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY due_date ASC',
      [req.user.id]
    );
    
    // For each task, get its labels
    const tasksWithLabels = await Promise.all(tasks.rows.map(async (task) => {
      // Get labels for this task
      const labelQuery = await db.query(
        `SELECT l.name 
         FROM labels l 
         INNER JOIN task_labels tl ON l.label_id = tl.label_id 
         WHERE tl.task_id = $1`,
        [task.task_id]
      );
      
      const labels = labelQuery.rows.map(row => row.name);
      
      // Get subtasks for this task
      const subtasksQuery = await db.query(
        'SELECT * FROM subtasks WHERE task_id = $1',
        [task.task_id]
      );
      
      const subtasks = subtasksQuery.rows.map(row => ({
        id: row.subtask_id,
        title: row.title,
        completed: row.completed
      }));
      
      // Calculate progress based on subtasks
      let progress = 0;
      if (subtasks.length > 0) {
        const completedSubtasks = subtasks.filter(subtask => subtask.completed).length;
        progress = Math.round((completedSubtasks / subtasks.length) * 100);
      } else if (task.status === 'Completed') {
        progress = 100;
      } else if (task.status === 'In Progress') {
        progress = 50;
      }
      
      return {
        ...task,
        labels,
        subtasks,
        progress
      };
    }));
    
    res.json(tasksWithLabels);
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
      'SELECT * FROM tasks WHERE task_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (task.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Get labels for this task
    const labelQuery = await db.query(
      `SELECT l.name 
       FROM labels l 
       INNER JOIN task_labels tl ON l.label_id = tl.label_id 
       WHERE tl.task_id = $1`,
      [req.params.id]
    );
    
    const labels = labelQuery.rows.map(row => row.name);
    
    // Get subtasks
    const subtasksQuery = await db.query(
      'SELECT * FROM subtasks WHERE task_id = $1',
      [req.params.id]
    );
    
    const subtasks = subtasksQuery.rows.map(row => ({
      id: row.subtask_id,
      title: row.title,
      completed: row.completed
    }));
    
    // Calculate progress
    let progress = 0;
    if (subtasks.length > 0) {
      const completedSubtasks = subtasks.filter(subtask => subtask.completed).length;
      progress = Math.round((completedSubtasks / subtasks.length) * 100);
    } else if (task.rows[0].status === 'Completed') {
      progress = 100;
    } else if (task.rows[0].status === 'In Progress') {
      progress = 50;
    }
    
    res.json({
      ...task.rows[0],
      labels,
      subtasks,
      progress
    });
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
    check('status', 'Status is required').isIn(['Not Started', 'In Progress', 'Completed']),
    check('priority', 'Priority must be either Low, Medium, or High').isIn(['Low', 'Medium', 'High']),
  ]
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { title, description, due_date, priority, status, labels = [], subtasks = [] } = req.body;
  
  try {
    const db = req.db;
    
    // Begin transaction
    await db.query('BEGIN');
    
    // Create task
    const newTask = await db.query(
      'INSERT INTO tasks (user_id, title, description, due_date, priority, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
      [req.user.id, title, description, due_date, priority, status]
    );
    
    const taskId = newTask.rows[0].task_id;
    
    // Add labels
    if (labels.length > 0) {
      for (const labelName of labels) {
        // Check if label exists for this user
        let labelQuery = await db.query(
          'SELECT label_id FROM labels WHERE user_id = $1 AND name = $2',
          [req.user.id, labelName]
        );
        
        let labelId;
        
        if (labelQuery.rows.length === 0) {
          // Create new label
          const newLabel = await db.query(
            'INSERT INTO labels (user_id, name) VALUES ($1, $2) RETURNING label_id',
            [req.user.id, labelName]
          );
          labelId = newLabel.rows[0].label_id;
        } else {
          labelId = labelQuery.rows[0].label_id;
        }
        
        // Add to task_labels junction table
        await db.query(
          'INSERT INTO task_labels (task_id, label_id) VALUES ($1, $2)',
          [taskId, labelId]
        );
      }
    }
    
    // Add subtasks
    if (subtasks.length > 0) {
      for (const subtask of subtasks) {
        await db.query(
          'INSERT INTO subtasks (task_id, title, completed) VALUES ($1, $2, $3)',
          [taskId, subtask.title, subtask.completed || false]
        );
      }
    }
    
    // Commit transaction
    await db.query('COMMIT');
    
    // Return created task with labels and subtasks
    const result = {
      ...newTask.rows[0],
      labels,
      subtasks,
      progress: 0
    };
    
    res.status(201).json(result);
  } catch (err) {
    // Rollback on error
    await db.query('ROLLBACK');
    
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { title, description, due_date, priority, status, labels, subtasks } = req.body;
  
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
      'SELECT * FROM tasks WHERE task_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (task.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }
    
    // Begin transaction
    await db.query('BEGIN');
    
    // Update task if there are fields to update
    const fieldsToUpdate = Object.keys(taskFields);
    if (fieldsToUpdate.length > 0) {
      const setQuery = fieldsToUpdate.map((field, i) => `${field} = $${i + 3}`).join(', ');
      const values = fieldsToUpdate.map(field => taskFields[field]);
      
      await db.query(
        `UPDATE tasks SET ${setQuery} WHERE task_id = $1 AND user_id = $2 RETURNING *`,
        [req.params.id, req.user.id, ...values]
      );
    }
    
    // Update labels if provided
    if (labels !== undefined) {
      // Remove existing task-label associations
      await db.query('DELETE FROM task_labels WHERE task_id = $1', [req.params.id]);
      
      // Add new labels
      if (labels.length > 0) {
        for (const labelName of labels) {
          // Check if label exists for this user
          let labelQuery = await db.query(
            'SELECT label_id FROM labels WHERE user_id = $1 AND name = $2',
            [req.user.id, labelName]
          );
          
          let labelId;
          
          if (labelQuery.rows.length === 0) {
            // Create new label
            const newLabel = await db.query(
              'INSERT INTO labels (user_id, name) VALUES ($1, $2) RETURNING label_id',
              [req.user.id, labelName]
            );
            labelId = newLabel.rows[0].label_id;
          } else {
            labelId = labelQuery.rows[0].label_id;
          }
          
          // Add to task_labels junction table
          await db.query(
            'INSERT INTO task_labels (task_id, label_id) VALUES ($1, $2)',
            [req.params.id, labelId]
          );
        }
      }
    }
    
    // Update subtasks if provided
    if (subtasks !== undefined) {
      // Delete all existing subtasks
      await db.query('DELETE FROM subtasks WHERE task_id = $1', [req.params.id]);
      
      // Add new subtasks
      if (subtasks.length > 0) {
        for (const subtask of subtasks) {
          await db.query(
            'INSERT INTO subtasks (task_id, title, completed) VALUES ($1, $2, $3)',
            [req.params.id, subtask.title, subtask.completed || false]
          );
        }
      }
    }
    
    // Commit transaction
    await db.query('COMMIT');
    
    // Get updated task with labels and subtasks
    const updatedTask = await db.query(
      'SELECT * FROM tasks WHERE task_id = $1',
      [req.params.id]
    );
    
    // Get labels for this task
    const labelQuery = await db.query(
      `SELECT l.name 
       FROM labels l 
       INNER JOIN task_labels tl ON l.label_id = tl.label_id 
       WHERE tl.task_id = $1`,
      [req.params.id]
    );
    
    const updatedLabels = labelQuery.rows.map(row => row.name);
    
    // Get subtasks
    const subtasksQuery = await db.query(
      'SELECT * FROM subtasks WHERE task_id = $1',
      [req.params.id]
    );
    
    const updatedSubtasks = subtasksQuery.rows.map(row => ({
      id: row.subtask_id,
      title: row.title,
      completed: row.completed
    }));
    
    // Calculate progress
    let progress = 0;
    if (updatedSubtasks.length > 0) {
      const completedSubtasks = updatedSubtasks.filter(subtask => subtask.completed).length;
      progress = Math.round((completedSubtasks / updatedSubtasks.length) * 100);
    } else if (updatedTask.rows[0].status === 'Completed') {
      progress = 100;
    } else if (updatedTask.rows[0].status === 'In Progress') {
      progress = 50;
    }
    
    res.json({
      ...updatedTask.rows[0],
      labels: updatedLabels,
      subtasks: updatedSubtasks,
      progress
    });
  } catch (err) {
    // Rollback on error
    await db.query('ROLLBACK');
    
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
      'SELECT * FROM tasks WHERE task_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (task.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }
    
    // Delete task (cascade will delete subtasks and task_labels)
    await db.query(
      'DELETE FROM tasks WHERE task_id = $1',
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
      'SELECT * FROM tasks WHERE task_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (task.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }
    
    // Update task to completed
    const updatedTask = await db.query(
      'UPDATE tasks SET status = $1, completed_at = NOW() WHERE task_id = $2 RETURNING *',
      ['Completed', req.params.id]
    );
    
    // Mark all subtasks as completed
    await db.query(
      'UPDATE subtasks SET completed = true WHERE task_id = $1',
      [req.params.id]
    );
    
    res.json(updatedTask.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
