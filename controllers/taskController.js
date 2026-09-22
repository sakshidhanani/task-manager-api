const { tasks, getNextId } = require('../data/tasks');

// GET /tasks - return all tasks
function getAllTasks(req, res) {
  res.status(200).json(tasks);
}

// GET /tasks/:id - return a single task
function getTaskById(req, res) {
  const id = parseInt(req.params.id, 10);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: `Task with id ${id} not found` });
  }

  res.status(200).json(task);
}

// POST /tasks - create a new task
function createTask(req, res, next) {
  try {
    const { title, completed } = req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Task "title" is required and must be a string' });
    }

    const newTask = {
      id: getNextId(),
      title,
      completed: Boolean(completed) || false,
    };

    tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (err) {
    next(err); // pass errors to the global error handler
  }
}

// PUT /tasks/:id - update an existing task
function updateTask(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const task = tasks.find((t) => t.id === id);

    if (!task) {
      return res.status(404).json({ error: `Task with id ${id} not found` });
    }

    const { title, completed } = req.body;
    if (title !== undefined) task.title = title;
    if (completed !== undefined) task.completed = Boolean(completed);

    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
}

// DELETE /tasks/:id - delete a task
function deleteTask(req, res) {
  const id = parseInt(req.params.id, 10);
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Task with id ${id} not found` });
  }

  const deleted = tasks.splice(index, 1);
  res.status(200).json({ message: 'Task deleted', task: deleted[0] });
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
