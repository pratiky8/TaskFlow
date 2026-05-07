import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getOverdueTasks,
} from '../controllers/taskController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes
router.route('/')
  .get(getTasks)
  .post(createTask);

router.get('/overdue', getOverdueTasks);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(adminOnly, deleteTask);

export default router;
