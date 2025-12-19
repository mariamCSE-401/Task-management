const express = require('express');
const router = express.Router();
const { Task } = require('../models');

// GET all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.findAll({ where: { deleted_at: null }, order: [['createdAt', 'DESC']] });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET task by ID
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task || task.deleted_at) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new task
router.post('/', async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update task
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task || task.deleted_at) return res.status(404).json({ error: 'Task not found' });
    await task.update(req.body);
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task || task.deleted_at) return res.status(404).json({ error: 'Task not found' });
    await task.update({ deleted_at: new Date() });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Restore soft-deleted task
router.put('/:id/restore', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task || !task.deleted_at) return res.status(404).json({ error: 'Task not found or not deleted' });
    await task.update({ deleted_at: null });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
