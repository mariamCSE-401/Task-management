const express = require('express');
const app = express();
const port = 3000;

// Tasks array: old tasks preserved + new tasks added
const tasks = [
  // old tasks
  { id: 1, title: 'Learn Node.js', completed: false, priority: 'high', createdAt: new Date('2025-10-30T10:00:00') },
  { id: 2, title: 'Build REST API', completed: false, priority: 'medium', createdAt: new Date('2025-10-30T12:00:00') },

  // new tasks
  { id: 3, title: 'Write unit tests', completed: false, priority: 'low', createdAt: new Date('2025-10-31T09:30:00') },
  { id: 4, title: 'Set up CI/CD', completed: false, priority: 'medium', createdAt: new Date('2025-10-31T11:00:00') },
  { id: 5, title: 'Deploy to production', completed: false, priority: 'high', createdAt: new Date('2025-10-31T14:00:00') }
];

// Root route
app.get('/', (req, res) => {
  res.send('Task Management API is running!');
});

// /tasks route
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
