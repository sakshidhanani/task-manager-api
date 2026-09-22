const express = require('express');
const router = express.Router();

const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

const validateTaskId = require('../middleware/validateTaskId');

router.get('/', getAllTasks);
router.get('/:id', validateTaskId, getTaskById);
router.post('/', createTask);
router.put('/:id', validateTaskId, updateTask);
router.delete('/:id', validateTaskId, deleteTask);

module.exports = router;
