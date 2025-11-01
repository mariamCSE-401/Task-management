const express = require('express');
const router = express.Router();

// ✅ Tasks array (keep existing tasks)
const tasks = [
  { id: 1, title: 'Learn Node.js', completed: false, priority: 'high', createdAt: new Date('2025-10-30T10:00:00') },
  { id: 2, title: 'Build REST API', completed: false, priority: 'medium', createdAt: new Date('2025-10-30T12:00:00') },
  { id: 3, title: 'Write unit tests', completed: false, priority: 'low', createdAt: new Date('2025-10-31T09:30:00') },
  { id: 4, title: 'Set up CI/CD', completed: false, priority: 'medium', createdAt: new Date('2025-10-31T11:00:00') },
  { id: 5, title: 'Deploy to production', completed: false, priority: 'high', createdAt: new Date('2025-10-31T14:00:00') }
];

// GET all tasks
router.get('/', (req, res) => {
  res.json(tasks);
});

// GET task by ID with error handling
router.get('/:id', (req, res) => {
  const taskId = parseInt(req.params.id);

  // Invalid ID (not a number)
  if (isNaN(taskId)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const task = tasks.find(t => t.id === taskId);

  // Task not found
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(task);
});

module.exports = router;
