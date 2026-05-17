import express from 'express';
import {
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus,
  getAllAppointments
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('patient'), createAppointment);
router.get('/mine', protect, getMyAppointments);
router.put('/:id/status', protect, authorize('doctor', 'admin'), updateAppointmentStatus);
router.get('/', protect, authorize('admin'), getAllAppointments);

export default router;
