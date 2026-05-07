import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  addMember,
  removeMember,
  deleteProject,
} from '../controllers/projectController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes
router.route('/')
  .get(getProjects)
  .post(adminOnly, createProject);

router.route('/:id')
  .get(getProjectById)
  .delete(adminOnly, deleteProject);

router.route('/:id/members')
  .post(adminOnly, addMember)
  .delete(adminOnly, removeMember);

export default router;
