const express = require('express');
const router = express.Router();
const db = require('../config/db'); 

// GET all tasks with pagination
// Query params: ?page=1&limit=10
router.get('/', async (req, res) => {
  try {
    // parse query params
    let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    const MAX_LIMIT = 50;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;

    const offset = (page - 1) * limit;

    // get total count
    const [countRows] = await db.query('SELECT COUNT(*) AS total FROM tasks');
    const totalTasks = countRows && countRows[0] ? countRows[0].total : 0;

    const totalPages = Math.max(1, Math.ceil(totalTasks / limit));

    // fetch page data
    const [rows] = await db.query(
      'SELECT * FROM tasks ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    // response with metadata
    res.json({
      totalTasks,
      totalPages,
      currentPage: page,
      limit,
      data: rows
    });
  } catch (err) {
    console.error('GET /tasks (pagination) error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST create new task
router.post('/', async (req, res) => {
  const { title, description, status } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const sql = 'INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)';
    const [result] = await db.query(sql, [title.trim(), description || null, status || 'pending']);
    const [newTaskRows] = await db.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json(newTaskRows[0]);
  } catch (err) {
    console.error('POST /tasks error:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT update task
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;

  try {
    const updates = [];
    const values = [];

    if (title !== undefined) {
      if (title === null || (typeof title === 'string' && title.trim() === '')) {
        return res.status(400).json({ error: 'Title cannot be empty' });
      }
      updates.push('title = ?');
      values.push(title);
    }

    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }

    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const sql = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const [updatedRows] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(updatedRows[0]);
  } catch (err) {
    console.error('PUT /tasks/:id error:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE task
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM tasks WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /tasks/:id error:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
