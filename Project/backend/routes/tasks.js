
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
    console.log("Fetching tasks for user:", req.user.id);
    
    // Get tasks - note the uppercase "Tasks" to match your schema
    const tasks = await db.query(
      'SELECT * FROM Tasks WHERE user_id = $1 ORDER BY due_date ASC',
      [req.user.id]
    );
    
    console.log(`Found ${tasks.rows.length} tasks`);
    
    // For each task, get its labels
    const tasksWithLabels = await Promise.all(tasks.rows.map(async (task) => {
      // Get labels for this task using correct case for tables
      const labelQuery = await db.query(
        `SELECT l.label_name as name 
         FROM Labels l 
         INNER JOIN Task_Labels tl ON l.label_id = tl.label_id 
         WHERE tl.task_id = $1`,
        [task.task_id]
      );
      
      const labels = labelQuery.rows.map(row => row.name);
      
      // Get subtasks for this task using correct case for Sub_Tasks
      const subtasksQuery = await db.query(
        'SELECT * FROM Sub_Tasks WHERE task_id = $1',
        [task.task_id]
      );
      
      const subtasks = subtasksQuery.rows.map(row => ({
        id: row.sub_task_id,
        title: row.title,
        completed: row.status === 'Completed'
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
    console.error("Error fetching tasks:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const db = req.db;
    console.log(`Fetching task ${req.params.id} for user ${req.user.id}`);
    
    const task = await db.query(
      'SELECT * FROM Tasks WHERE task_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (task.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Get labels for this task
    const labelQuery = await db.query(
      `SELECT l.label_name as name 
       FROM Labels l 
       INNER JOIN Task_Labels tl ON l.label_id = tl.label_id 
       WHERE tl.task_id = $1`,
      [req.params.id]
    );
    
    const labels = labelQuery.rows.map(row => row.name);
    
    // Get subtasks
    const subtasksQuery = await db.query(
      'SELECT * FROM Sub_Tasks WHERE task_id = $1',
      [req.params.id]
    );
    
    const subtasks = subtasksQuery.rows.map(row => ({
      id: row.sub_task_id,
      title: row.title,
      completed: row.status === 'Completed'
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
    console.error(`Error fetching task ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', [
  auth,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('status', 'Status is required').isIn(['Pending', 'In Progress', 'Completed', 'Overdue']),
    check('priority', 'Priority must be between 1 and 5').isInt({ min: 1, max: 5 }),
  ]
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { title, description, due_date, priority, status, labels = [], subtasks = [] } = req.body;
  
  try {
    const db = req.db;
    console.log("Creating new task:", { title, priority, status });
    
    // Begin transaction
    await db.query('BEGIN');
    
    // Create task with correct table name case
    const newTask = await db.query(
      'INSERT INTO Tasks (user_id, title, description, due_date, priority, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
      [req.user.id, title, description, due_date, priority, status]
    );
    
    const taskId = newTask.rows[0].task_id;
    console.log(`Created task with ID: ${taskId}`);
    
    // Add labels
    if (labels.length > 0) {
      for (const labelName of labels) {
        // Check if label exists for this user
        let labelQuery = await db.query(
          'SELECT label_id FROM Labels WHERE user_id = $1 AND label_name = $2',
          [req.user.id, labelName]
        );
        
        let labelId;
        
        if (labelQuery.rows.length === 0) {
          // Create new label with default color
          const newLabel = await db.query(
            'INSERT INTO Labels (user_id, label_name, color_code) VALUES ($1, $2, $3) RETURNING label_id',
            [req.user.id, labelName, '#3B82F6']  // Default blue color
          );
          labelId = newLabel.rows[0].label_id;
          console.log(`Created new label: ${labelName} with ID ${labelId}`);
        } else {
          labelId = labelQuery.rows[0].label_id;
        }
        
        // Add to task_labels junction table
        await db.query(
          'INSERT INTO Task_Labels (task_id, label_id) VALUES ($1, $2)',
          [taskId, labelId]
        );
        console.log(`Added label ${labelName} to task ${taskId}`);
      }
    }
    
    // Add subtasks
    if (subtasks.length > 0) {
      for (const subtask of subtasks) {
        await db.query(
          'INSERT INTO Sub_Tasks (task_id, title, status) VALUES ($1, $2, $3)',
          [taskId, subtask.title, subtask.completed ? 'Completed' : 'Pending']
        );
        console.log(`Added subtask "${subtask.title}" to task ${taskId}`);
      }
    }
    
    // Commit transaction
    await db.query('COMMIT');
    console.log(`Transaction committed successfully for task ${taskId}`);
    
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
    
    console.error("Error creating task:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
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
    console.log(`Updating task ${req.params.id}:`, taskFields);
    
    // Check if task exists and belongs to user
    let task = await db.query(
      'SELECT * FROM Tasks WHERE task_id = $1 AND user_id = $2',
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
        `UPDATE Tasks SET ${setQuery} WHERE task_id = $1 AND user_id = $2 RETURNING *`,
        [req.params.id, req.user.id, ...values]
      );
      console.log(`Updated task fields for task ${req.params.id}`);
    }
    
    // Update labels if provided
    if (labels !== undefined) {
      // Remove existing task-label associations
      await db.query('DELETE FROM Task_Labels WHERE task_id = $1', [req.params.id]);
      console.log(`Removed existing labels for task ${req.params.id}`);
      
      // Add new labels
      if (labels.length > 0) {
        for (const labelName of labels) {
          // Check if label exists for this user
          let labelQuery = await db.query(
            'SELECT label_id FROM Labels WHERE user_id = $1 AND label_name = $2',
            [req.user.id, labelName]
          );
          
          let labelId;
          
          if (labelQuery.rows.length === 0) {
            // Create new label with default color
            const newLabel = await db.query(
              'INSERT INTO Labels (user_id, label_name, color_code) VALUES ($1, $2, $3) RETURNING label_id',
              [req.user.id, labelName, '#3B82F6']  // Default blue color
            );
            labelId = newLabel.rows[0].label_id;
            console.log(`Created new label: ${labelName} with ID ${labelId}`);
          } else {
            labelId = labelQuery.rows[0].label_id;
          }
          
          // Add to task_labels junction table
          await db.query(
            'INSERT INTO Task_Labels (task_id, label_id) VALUES ($1, $2)',
            [req.params.id, labelId]
          );
          console.log(`Added label ${labelName} to task ${req.params.id}`);
        }
      }
    }
    
    // Update subtasks if provided
    if (subtasks !== undefined) {
      // Delete all existing subtasks
      await db.query('DELETE FROM Sub_Tasks WHERE task_id = $1', [req.params.id]);
      console.log(`Removed existing subtasks for task ${req.params.id}`);
      
      // Add new subtasks
      if (subtasks.length > 0) {
        for (const subtask of subtasks) {
          await db.query(
            'INSERT INTO Sub_Tasks (task_id, title, status) VALUES ($1, $2, $3)',
            [req.params.id, subtask.title, subtask.completed ? 'Completed' : 'Pending']
          );
          console.log(`Added subtask "${subtask.title}" to task ${req.params.id}`);
        }
      }
    }
    
    // Commit transaction
    await db.query('COMMIT');
    console.log(`Transaction committed successfully for task update ${req.params.id}`);
    
    // Get updated task with labels and subtasks
    const updatedTask = await db.query(
      'SELECT * FROM Tasks WHERE task_id = $1',
      [req.params.id]
    );
    
    // Get labels for this task
    const labelQuery = await db.query(
      `SELECT l.label_name as name 
       FROM Labels l 
       INNER JOIN Task_Labels tl ON l.label_id = tl.label_id 
       WHERE tl.task_id = $1`,
      [req.params.id]
    );
    
    const updatedLabels = labelQuery.rows.map(row => row.name);
    
    // Get subtasks
    const subtasksQuery = await db.query(
      'SELECT * FROM Sub_Tasks WHERE task_id = $1',
      [req.params.id]
    );
    
    const updatedSubtasks = subtasksQuery.rows.map(row => ({
      id: row.sub_task_id,
      title: row.title,
      completed: row.status === 'Completed'
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
    
    console.error(`Error updating task ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   DELETE api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const db = req.db;
    console.log(`Deleting task ${req.params.id}`);
    
    // Check if task exists and belongs to user
    let task = await db.query(
      'SELECT * FROM Tasks WHERE task_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (task.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }
    
    // Delete task (cascade will delete subtasks and task_labels)
    await db.query(
      'DELETE FROM Tasks WHERE task_id = $1',
      [req.params.id]
    );
    console.log(`Deleted task ${req.params.id}`);
    
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error(`Error deleting task ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT api/tasks/:id/complete
// @desc    Mark task as completed
// @access  Private
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const db = req.db;
    console.log(`Marking task ${req.params.id} as completed`);
    
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
    
    // Mark all subtasks as completed
    await db.query(
      'UPDATE Sub_Tasks SET status = $1 WHERE task_id = $2',
      ['Completed', req.params.id]
    );
    console.log(`Marked task ${req.params.id} and all its subtasks as completed`);
    
    res.json(updatedTask.rows[0]);
  } catch (err) {
    console.error(`Error completing task ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
