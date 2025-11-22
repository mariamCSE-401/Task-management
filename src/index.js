const express = require('express');
const app = express();
const port = 3000;

const taskRoutes = require('./routes/tasks');

app.use(express.json());

// Use tasks router (ONLY ONCE)
app.use('/tasks', taskRoutes);

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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
