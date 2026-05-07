import express from 'express';
import { signup, login, getAllUsers, deleteUser, searchUsers } from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Admin only routes
router.get('/users', protect, adminOnly, getAllUsers);
router.delete('/users/:id', protect, adminOnly, deleteUser);

// Authenticated user routes
router.get('/users/search', protect, searchUsers);

export default router;
