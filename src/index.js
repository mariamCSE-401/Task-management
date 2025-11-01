const express = require('express');
const app = express();
const port = 3000;

const taskRoutes = require('./routes/tasks'); // নতুন routes import

app.use(express.json()); // JSON parsing middleware

// Root route
app.get('/', (req, res) => {
  res.send('Task Management API is running!');
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime()
  });
});

// Use /tasks routes from tasks.js
app.use('/tasks', taskRoutes);

// Server start
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
