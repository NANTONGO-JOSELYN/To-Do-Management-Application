require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;
const TASKS_FILE = path.join(__dirname, 'data', 'tasks.json');

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Utility functions
const ensureDataDirectory = async () => {
  const dataDir = path.dirname(TASKS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
};

const readTasksFromFile = async () => {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(TASKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty array
      return [];
    }
    throw error;
  }
};

const writeTasksToFile = async (tasks) => {
  await ensureDataDirectory();
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
};

const validateTask = (task) => {
  const errors = [];

  if (!task.text || typeof task.text !== 'string' || task.text.trim().length === 0) {
    errors.push('Task text is required');
  } else if (task.text.length < 3) {
    errors.push('Task text must be at least 3 characters');
  } else if (task.text.length > 100) {
    errors.push('Task text must be less than 100 characters');
  }

  if (task.description && task.description.length > 500) {
    errors.push('Description must be less than 500 characters');
  }

  if (task.priority && !['low', 'medium', 'high'].includes(task.priority)) {
    errors.push('Priority must be low, medium, or high');
  }

  if (task.category && !['personal', 'work', 'shopping', 'health'].includes(task.category)) {
    errors.push('Category must be personal, work, shopping, or health');
  }

  if (task.deadline) {
    const deadlineDate = new Date(task.deadline);
    if (isNaN(deadlineDate.getTime())) {
      errors.push('Invalid deadline format');
    }
  }

  return errors;
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Get all tasks
app.get('/api/tasks', asyncHandler(async (req, res) => {
  const tasks = await readTasksFromFile();
  
  // Apply filters if provided
  let filteredTasks = tasks;
  
  const { status, priority, category, search, sortBy, sortOrder } = req.query;
  
  // Filter by status
  if (status && status !== 'all') {
    if (status === 'active') {
      filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (status === 'completed') {
      filteredTasks = filteredTasks.filter(task => task.completed);
    }
  }
  
  // Filter by priority
  if (priority && priority !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.priority === priority);
  }
  
  // Filter by category
  if (category && category !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.category === category);
  }
  
  // Filter by search term
  if (search) {
    const searchLower = search.toLowerCase();
    filteredTasks = filteredTasks.filter(task => 
      task.text.toLowerCase().includes(searchLower) ||
      (task.description && task.description.toLowerCase().includes(searchLower)) ||
      (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchLower)))
    );
  }
  
  // Sort tasks
  if (sortBy) {
    filteredTasks.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'name':
          aValue = a.text.toLowerCase();
          bValue = b.text.toLowerCase();
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'deadline':
          aValue = a.deadline ? new Date(a.deadline) : new Date('9999-12-31');
          bValue = b.deadline ? new Date(b.deadline) : new Date('9999-12-31');
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }
      
      if (aValue < bValue) return sortOrder === 'desc' ? 1 : -1;
      if (aValue > bValue) return sortOrder === 'desc' ? -1 : 1;
      return 0;
    });
  }
  
  res.json({
    tasks: filteredTasks,
    total: tasks.length,
    filtered: filteredTasks.length,
    timestamp: new Date().toISOString()
  });
}));

// Get task by ID
app.get('/api/tasks/:id', asyncHandler(async (req, res) => {
  const tasks = await readTasksFromFile();
  const task = tasks.find(t => t.id === req.params.id);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  res.json(task);
}));

// Create new task
app.post('/api/tasks', asyncHandler(async (req, res) => {
  const taskData = req.body;
  
  // Validate task data
  const validationErrors = validateTask(taskData);
  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }
  
  // Create new task
  const newTask = {
    id: uuidv4(),
    text: taskData.text.trim(),
    description: taskData.description?.trim() || '',
    priority: taskData.priority || 'medium',
    category: taskData.category || 'personal',
    deadline: taskData.deadline || null,
    tags: Array.isArray(taskData.tags) ? taskData.tags : [],
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
    order: 0
  };
  
  // Read existing tasks and add new one
  const tasks = await readTasksFromFile();
  
  // Set order to be at the end
  newTask.order = tasks.length;
  
  tasks.push(newTask);
  await writeTasksToFile(tasks);
  
  res.status(201).json({
    message: 'Task created successfully',
    task: newTask
  });
}));

// Update task
app.put('/api/tasks/:id', asyncHandler(async (req, res) => {
  const taskId = req.params.id;
  const updateData = req.body;
  
  const tasks = await readTasksFromFile();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  // Validate update data if text is being updated
  if (updateData.text !== undefined) {
    const validationErrors = validateTask(updateData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }
  }
  
  // Update task
  const existingTask = tasks[taskIndex];
  const updatedTask = {
    ...existingTask,
    ...updateData,
    updatedAt: new Date().toISOString(),
    // Handle completion status
    completedAt: updateData.completed && !existingTask.completed 
      ? new Date().toISOString() 
      : !updateData.completed 
      ? null 
      : existingTask.completedAt
  };
  
  tasks[taskIndex] = updatedTask;
  await writeTasksToFile(tasks);
  
  res.json({
    message: 'Task updated successfully',
    task: updatedTask
  });
}));

// Delete task
app.delete('/api/tasks/:id', asyncHandler(async (req, res) => {
  const taskId = req.params.id;
  
  const tasks = await readTasksFromFile();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const deletedTask = tasks[taskIndex];
  tasks.splice(taskIndex, 1);
  
  // Update order for remaining tasks
  tasks.forEach((task, index) => {
    task.order = index;
  });
  
  await writeTasksToFile(tasks);
  
  res.json({
    message: 'Task deleted successfully',
    task: deletedTask
  });
}));

// Bulk operations
app.post('/api/tasks/bulk', asyncHandler(async (req, res) => {
  const { action, taskIds } = req.body;
  
  if (!action || !Array.isArray(taskIds) || taskIds.length === 0) {
    return res.status(400).json({ error: 'Invalid bulk operation request' });
  }
  
  const tasks = await readTasksFromFile();
  let updatedCount = 0;
  
  switch (action) {
    case 'complete':
      tasks.forEach(task => {
        if (taskIds.includes(task.id) && !task.completed) {
          task.completed = true;
          task.completedAt = new Date().toISOString();
          task.updatedAt = new Date().toISOString();
          updatedCount++;
        }
      });
      break;
      
    case 'incomplete':
      tasks.forEach(task => {
        if (taskIds.includes(task.id) && task.completed) {
          task.completed = false;
          task.completedAt = null;
          task.updatedAt = new Date().toISOString();
          updatedCount++;
        }
      });
      break;
      
    case 'delete':
      for (let i = tasks.length - 1; i >= 0; i--) {
        if (taskIds.includes(tasks[i].id)) {
          tasks.splice(i, 1);
          updatedCount++;
        }
      }
      // Update order for remaining tasks
      tasks.forEach((task, index) => {
        task.order = index;
      });
      break;
      
    default:
      return res.status(400).json({ error: 'Invalid bulk action' });
  }
  
  await writeTasksToFile(tasks);
  
  res.json({
    message: `Bulk ${action} completed successfully`,
    updatedCount,
    totalTasks: tasks.length
  });
}));

// Reorder tasks
app.put('/api/tasks/reorder', asyncHandler(async (req, res) => {
  const { taskIds } = req.body;
  
  if (!Array.isArray(taskIds)) {
    return res.status(400).json({ error: 'taskIds must be an array' });
  }
  
  const tasks = await readTasksFromFile();
  
  // Create a map of task ID to task
  const taskMap = new Map(tasks.map(task => [task.id, task]));
  
  // Reorder tasks based on the provided order
  const reorderedTasks = [];
  taskIds.forEach((id, index) => {
    const task = taskMap.get(id);
    if (task) {
      task.order = index;
      task.updatedAt = new Date().toISOString();
      reorderedTasks.push(task);
    }
  });
  
  // Add any tasks not in the reorder list at the end
  tasks.forEach(task => {
    if (!taskIds.includes(task.id)) {
      task.order = reorderedTasks.length;
      reorderedTasks.push(task);
    }
  });
  
  await writeTasksToFile(reorderedTasks);
  
  res.json({
    message: 'Tasks reordered successfully',
    totalTasks: reorderedTasks.length
  });
}));

// Get task statistics
app.get('/api/stats', asyncHandler(async (req, res) => {
  const tasks = await readTasksFromFile();
  
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    active: tasks.filter(t => !t.completed).length,
    overdue: 0,
    byPriority: {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    },
    byCategory: {
      personal: tasks.filter(t => t.category === 'personal').length,
      work: tasks.filter(t => t.category === 'work').length,
      shopping: tasks.filter(t => t.category === 'shopping').length,
      health: tasks.filter(t => t.category === 'health').length
    },
    recentlyCompleted: tasks.filter(t => {
      if (!t.completedAt) return false;
      const completedDate = new Date(t.completedAt);
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);
      return completedDate > dayAgo;
    }).length
  };
  
  // Calculate overdue tasks
  const now = new Date();
  stats.overdue = tasks.filter(t => {
    if (t.completed || !t.deadline) return false;
    return new Date(t.deadline) < now;
  }).length;
  
  res.json(stats);
}));

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Task Management API Server running on port ${PORT}`);
  console.log(`📁 Data file: ${TASKS_FILE}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
