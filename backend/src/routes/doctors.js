const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

/**
 * Doctor Routes
 * 
 * Public Routes:
 * - GET /api/doctors : List doctors with filters
 * - GET /api/doctors/:id : Get single doctor
 * - GET /api/doctors/:id/availability : Get available slots for date
 * 
 * Protected Routes:
 * - POST /api/doctors/availability : Set schedule (Doctor only)
 */

router.get('/', doctorController.getDoctors);
router.get('/cities', doctorController.getCities);
router.get('/:id', doctorController.getDoctorById);
router.get('/:id/availability', doctorController.getAvailableSlots);

router.post('/availability', protect, authorize('doctor'), doctorController.setAvailability);
router.patch('/:id/verify', protect, authorize('admin'), doctorController.verifyDoctor);

module.exports = router;
