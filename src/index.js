const express = require('express');
const app = express();
const port = 3000;
const tasks = [
       { id: 1, title: 'Learn Node.js', completed: false },
       { id: 2, title: 'Build REST API', completed: false }
];
app.get('/', (req, res) => {
       res.send('Task Management API is running!');
});
app.get('/tasks', (req, res) => {
       res.json(tasks);
});
app.listen(port, () => {
       console.log(`Server running at http://localhost:${port}`);
});
