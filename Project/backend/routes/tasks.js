
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
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY due_date ASC',
      [req.user.id]
    );
    
    console.log(`Found ${tasks.rows.length} tasks`);
    
    // For each task, get its labels
    const tasksWithLabels = await Promise.all(tasks.rows.map(async (task) => {
      // Get labels for this task using correct case for tables
      const labelQuery = await db.query(
        `SELECT l.label_name as name 
         FROM labels l 
         INNER JOIN task_labels tl ON l.label_id = tl.label_id 
         WHERE tl.task_id = $1`,
        [task.task_id]
      );
      
      const labels = labelQuery.rows.map(row => row.name);
      
      // Get subtasks for this task using correct case for Sub_Tasks
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
      'SELECT * FROM tasks WHERE task_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (task.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Get labels for this task
    const labelQuery = await db.query(
      `SELECT l.label_name as name 
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
    check('due_date', 'Due date is required').not().isEmpty(),
    check('priority', 'Priority must be between 1 and 5').isInt({ min: 1, max: 5 })
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = req.db;
    const { title, description, due_date, priority, status = 'Pending', labels = [], subtasks = [] } = req.body;
    
    // Validate status is one of the allowed values
    const validStatuses = ['Pending', 'In Progress', 'Completed', 'Overdue'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    console.log('Creating new task:', { title, due_date, priority, status });
    
    // Insert task
    const taskResult = await db.query(
      `INSERT INTO tasks 
       (user_id, title, description, due_date, priority, status) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [req.user.id, title, description, due_date, priority, status]
    );
    
    const task = taskResult.rows[0];
    
    // Process labels if provided
    if (labels && labels.length > 0) {
      for (const labelName of labels) {
        // Check if label exists for this user
        const labelResult = await db.query(
          'SELECT * FROM labels WHERE user_id = $1 AND label_name = $2',
          [req.user.id, labelName]
        );
        
        let labelId;
        
        if (labelResult.rows.length > 0) {
          // Use existing label
          labelId = labelResult.rows[0].label_id;
        } else {
          // Create new label with a default color
          const newLabelResult = await db.query(
            `INSERT INTO labels 
             (user_id, label_name, color) 
             VALUES ($1, $2, $3) 
             RETURNING label_id`,
            [req.user.id, labelName, '#' + Math.floor(Math.random()*16777215).toString(16)]
          );
          
          labelId = newLabelResult.rows[0].label_id;
        }
        
        // Associate label with task
        await db.query(
          'INSERT INTO task_labels (task_id, label_id) VALUES ($1, $2)',
          [task.task_id, labelId]
        );
      }
    }
    
    // Process subtasks if provided
    if (subtasks && subtasks.length > 0) {
      for (const subtask of subtasks) {
        await db.query(
          `INSERT INTO subtasks 
           (task_id, title, completed) 
           VALUES ($1, $2, $3)`,
          [task.task_id, subtask.title, subtask.completed || false]
        );
      }
    }
    
    // Return complete task with labels and subtasks
    res.json({
      ...task,
      labels,
      subtasks: subtasks.map((subtask, index) => ({
        id: index + 1,
        title: subtask.title,
        completed: subtask.completed || false
      })),
      progress: 0
    });
    
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const db = req.db;
    const taskId = req.params.id;
    
    // Verify task belongs to user
    const taskCheck = await db.query(
      'SELECT * FROM tasks WHERE task_id = $1 AND user_id = $2',
      [taskId, req.user.id]
    );
    
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }
    
    const oldTask = taskCheck.rows[0];
    
    // Extract fields to update - only update fields that are provided
    const { 
      title, 
      description, 
      due_date, 
      priority, 
      status, 
      labels,
      subtasks,
      progress 
    } = req.body;
    
    // Build update query dynamically
    let updateFields = [];
    let queryParams = [];
    let paramCounter = 1;
    
    if (title !== undefined) {
      updateFields.push(`title = $${paramCounter}`);
      queryParams.push(title);
      paramCounter++;
    }
    
    if (description !== undefined) {
      updateFields.push(`description = $${paramCounter}`);
      queryParams.push(description);
      paramCounter++;
    }
    
    if (due_date !== undefined) {
      updateFields.push(`due_date = $${paramCounter}`);
      queryParams.push(due_date);
      paramCounter++;
    }
    
    if (priority !== undefined) {
      updateFields.push(`priority = $${paramCounter}`);
      queryParams.push(priority);
      paramCounter++;
    }
    
    if (status !== undefined) {
      // Validate status is one of the allowed values
      const validStatuses = ['Pending', 'In Progress', 'Completed', 'Overdue'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
      
      updateFields.push(`status = $${paramCounter}`);
      queryParams.push(status);
      paramCounter++;
      
      // If status changed to completed, set completed_at timestamp
      if (status === 'Completed' && oldTask.status !== 'Completed') {
        updateFields.push(`completed_at = $${paramCounter}`);
        queryParams.push(new Date());
        paramCounter++;
      }
      
      // If status changed from completed, clear completed_at
      if (status !== 'Completed' && oldTask.status === 'Completed') {
        updateFields.push(`completed_at = $${paramCounter}`);
        queryParams.push(null);
        paramCounter++;
      }
    }
    
    // Only update if we have fields to update
    let updatedTask = oldTask;
    if (updateFields.length > 0) {
      // Add required parameters to the query array
      queryParams.push(taskId);
      queryParams.push(req.user.id);
      
      const updateQuery = `
        UPDATE tasks 
        SET ${updateFields.join(', ')}
        WHERE task_id = $${paramCounter} AND user_id = $${paramCounter + 1}
        RETURNING *
      `;
      
      const result = await db.query(updateQuery, queryParams);
      updatedTask = result.rows[0];
    }
    
    // Handle labels if provided
    if (labels !== undefined) {
      // First remove existing task-label associations
      await db.query('DELETE FROM task_labels WHERE task_id = $1', [taskId]);
      
      // Then add the new labels
      for (const labelName of labels) {
        // Check if label exists for this user
        const labelResult = await db.query(
          'SELECT * FROM labels WHERE user_id = $1 AND label_name = $2',
          [req.user.id, labelName]
        );
        
        let labelId;
        
        if (labelResult.rows.length > 0) {
          // Use existing label
          labelId = labelResult.rows[0].label_id;
        } else {
          // Create new label with a default color
          const newLabelResult = await db.query(
            `INSERT INTO labels 
             (user_id, label_name, color) 
             VALUES ($1, $2, $3) 
             RETURNING label_id`,
            [req.user.id, labelName, '#' + Math.floor(Math.random()*16777215).toString(16)]
          );
          
          labelId = newLabelResult.rows[0].label_id;
        }
        
        // Associate label with task
        await db.query(
          'INSERT INTO task_labels (task_id, label_id) VALUES ($1, $2)',
          [taskId, labelId]
        );
      }
    }
    
    // Handle subtasks if provided
    if (subtasks !== undefined) {
      // First remove existing subtasks
      await db.query('DELETE FROM subtasks WHERE task_id = $1', [taskId]);
      
      // Then add the new subtasks
      for (const subtask of subtasks) {
        await db.query(
          `INSERT INTO subtasks 
           (task_id, title, completed) 
           VALUES ($1, $2, $3)`,
          [taskId, subtask.title, subtask.completed || false]
        );
      }
      
      // Update progress if subtasks were updated
      if (subtasks.length > 0) {
        const completedCount = subtasks.filter(st => st.completed).length;
        const newProgress = Math.round((completedCount / subtasks.length) * 100);
        
        await db.query(
          'UPDATE tasks SET progress = $1 WHERE task_id = $2',
          [newProgress, taskId]
        );
        
        updatedTask.progress = newProgress;
      }
    }
    
    // Update progress directly if provided
    if (progress !== undefined && subtasks === undefined) {
      await db.query(
        'UPDATE tasks SET progress = $1 WHERE task_id = $2',
        [progress, taskId]
      );
      
      updatedTask.progress = progress;
    }
    
    // Get updated labels
    const labelQuery = await db.query(
      `SELECT l.label_name as name 
       FROM labels l 
       INNER JOIN task_labels tl ON l.label_id = tl.label_id 
       WHERE tl.task_id = $1`,
      [taskId]
    );
    
    const updatedLabels = labelQuery.rows.map(row => row.name);
    
    // Get updated subtasks
    const subtasksQuery = await db.query(
      'SELECT * FROM subtasks WHERE task_id = $1',
      [taskId]
    );
    
    const updatedSubtasks = subtasksQuery.rows.map(row => ({
      id: row.subtask_id,
      title: row.title,
      completed: row.completed
    }));
    
    // Return complete updated task
    res.json({
      ...updatedTask,
      labels: updatedLabels,
      subtasks: updatedSubtasks
    });
    
  } catch (err) {
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
    
    const result = await db.query(
      'DELETE FROM tasks WHERE task_id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }
    
    res.json({ message: 'Task deleted' });
    
  } catch (err) {
    console.error(`Error deleting task ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT api/tasks/:id/complete
// @desc    Mark a task as completed
// @access  Private
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const db = req.db;
    
    const result = await db.query(
      `UPDATE tasks 
       SET status = 'Completed', completed_at = $1, progress = 100 
       WHERE task_id = $2 AND user_id = $3 
       RETURNING *`,
      [new Date(), req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }
    
    // Also mark all subtasks as completed
    await db.query(
      'UPDATE subtasks SET completed = true WHERE task_id = $1',
      [req.params.id]
    );
    
    const task = result.rows[0];
    
    // Get labels for this task
    const labelQuery = await db.query(
      `SELECT l.label_name as name 
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
    
    res.json({
      ...task,
      labels,
      subtasks,
      progress: 100
    });
    
  } catch (err) {
    console.error(`Error completing task ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
