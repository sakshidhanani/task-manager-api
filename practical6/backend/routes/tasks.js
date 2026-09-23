const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// GET /tasks - get all tasks
router.get('/', async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
});

// GET /tasks/:id - get a single task
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (err) {
    // Malformed ObjectId also lands here -> treat as "not found" for the client
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Task not found' });
    }
    next(err);
  }
});

// POST /tasks - create a task
router.post('/', async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const task = await Task.create({ title, description, completed, priority });
    res.status(201).json(task);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

// PUT /tasks/:id - update a task
router.put('/:id', async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, completed, priority },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Task not found' });
    }
    next(err);
  }
});

// DELETE /tasks/:id - delete a task
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted', id: req.params.id });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Task not found' });
    }
    next(err);
  }
});

module.exports = router;
