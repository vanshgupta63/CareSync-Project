import express from 'express';
import { createRecord, getMyRecords, getPatientRecords } from '../controllers/recordController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('doctor'), createRecord);
router.get('/mine', protect, authorize('patient'), getMyRecords);
router.get('/patient/:patientId', protect, authorize('doctor', 'admin'), getPatientRecords);

export default router;
