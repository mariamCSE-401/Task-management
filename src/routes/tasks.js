const express = require('express');
const router = express.Router();
const db = require('../config/db'); 

// helper to build where clause (includeDeleted = true => only deleted)
function buildWhereClause({ includeDeleted = false, q = null }) {
  let where = includeDeleted ? 'WHERE deleted_at IS NOT NULL' : 'WHERE deleted_at IS NULL';
  const params = [];
  if (q && q.length) {
    where += ' AND LOWER(title) LIKE ?';
    params.push(`%${q.toLowerCase()}%`);
  }
  return { where, params };
}

// GET /tasks (pagination + optional q) -> excludes soft-deleted by default
router.get('/', async (req, res) => {
  try {
    let page = parseInt(req.query.page, 10); if (isNaN(page) || page < 1) page = 1;
    let limit = parseInt(req.query.limit, 10); if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 50) limit = 50;
    const offset = (page - 1) * limit;
    const q = req.query.q ? String(req.query.q).trim() : null;

    const { where, params } = buildWhereClause({ includeDeleted: false, q });
    const [crows] = await db.query(`SELECT COUNT(*) AS total FROM tasks ${where}`, params);
    const totalTasks = crows[0] ? Number(crows[0].total) : 0;
    const totalPages = totalTasks === 0 ? 0 : Math.ceil(totalTasks / limit);

    const [rows] = await db.query(
      `SELECT * FROM tasks ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({ totalTasks, totalPages, currentPage: page, limit, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /tasks/deleted -> only soft-deleted tasks
router.get('/deleted', async (req, res) => {
  try {
    let page = parseInt(req.query.page, 10); if (isNaN(page) || page < 1) page = 1;
    let limit = parseInt(req.query.limit, 10); if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 50) limit = 50;
    const offset = (page - 1) * limit;
    const q = req.query.q ? String(req.query.q).trim() : null;

    const { where, params } = buildWhereClause({ includeDeleted: true, q });
    const [crows] = await db.query(`SELECT COUNT(*) AS total FROM tasks ${where}`, params);
    const totalTasks = crows[0] ? Number(crows[0].total) : 0;
    const totalPages = totalTasks === 0 ? 0 : Math.ceil(totalTasks / limit);

    const [rows] = await db.query(
      `SELECT * FROM tasks ${where} ORDER BY deleted_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({ totalTasks, totalPages, currentPage: page, limit, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST create
router.post('/', async (req, res) => {
  const { title, description, status } = req.body;
  if (!title || title.trim() === '') return res.status(400).json({ error: 'Title is required' });
  try {
    const [result] = await db.query(
      'INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)',
      [title.trim(), description || null, status || 'pending']
    );
    const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT update (only non-deleted)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;
  try {
    const updates = []; const values = [];
    if (title !== undefined) { if (title === null || (typeof title === 'string' && title.trim() === '')) return res.status(400).json({ error: 'Title cannot be empty' }); updates.push('title = ?'); values.push(title); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(id);
    const [result] = await db.query(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ? AND deleted_at IS NULL`, values);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found or deleted' });
    const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE -> soft delete: set deleted_at = NOW()
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('UPDATE tasks SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found or already deleted' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// PUT /tasks/:id/restore -> restore soft-deleted task
router.put('/:id/restore', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(
      'UPDATE tasks SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found or not deleted' });
    }
    const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to restore task' });
  }
});


module.exports = router;
