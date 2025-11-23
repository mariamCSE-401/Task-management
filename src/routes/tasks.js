const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
// GET /tasks with pagination and optional search q

router.get('/', async (req, res) => {
  try {
    // parse & validate pagination params
    let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    const MAX_LIMIT = 50;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;
    const offset = (page - 1) * limit;

    // parse search query
    const q = req.query.q ? String(req.query.q).trim() : null;
    let whereClause = '';
    const whereParams = [];

    if (q && q.length > 0) {
      // case-insensitive search using LOWER(title) LIKE ?
      whereClause = 'WHERE LOWER(title) LIKE ?';
      whereParams.push(`%${q.toLowerCase()}%`);
    }

    // 1) get total count with same filter
    const countSql = `SELECT COUNT(*) AS total FROM tasks ${whereClause}`;
    const [countRows] = await db.query(countSql, whereParams);
    const totalTasks = (countRows && countRows[0]) ? Number(countRows[0].total) : 0;

    // compute total pages (0 if no tasks)
    const totalPages = totalTasks === 0 ? 0 : Math.ceil(totalTasks / limit);

    // 2) fetch page data with same filter
    // note: parameters order => whereParams..., limit, offset
    const dataSql = `SELECT * FROM tasks ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const dataParams = [...whereParams, limit, offset];
    const [rows] = await db.query(dataSql, dataParams);

    // respond with metadata + data
    res.json({
      totalTasks,
      totalPages,
      currentPage: page,
      limit,
      data: rows
    });
  } catch (err) {
    console.error('GET /tasks (pagination+search) error:', err);
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
