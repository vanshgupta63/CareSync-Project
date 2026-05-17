import express from 'express';
import {
  getAllUsers,
  getAllDoctors,
  getUserProfile,
  updateUserProfile,
  deleteUser
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/doctors', protect, getAllDoctors);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/', protect, authorize('admin'), getAllUsers);
router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router;
