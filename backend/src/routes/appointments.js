const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

/**
 * Appointment Routes
 * 
 * All routes are protected by JWT auth.
 */

// 1. Booking & Core Management
router.post('/', protect, authorize('patient'), appointmentController.bookAppointment);
router.put('/:id/reschedule', protect, appointmentController.rescheduleAppointment);
router.delete('/:id', protect, appointmentController.cancelAppointment);
router.put('/:id/status', protect, authorize('doctor', 'admin'), appointmentController.updateStatus);

// 2. Dashboard Data
router.get('/patient/:id', protect, appointmentController.getPatientAppointments);
router.get('/doctor/:id', protect, appointmentController.getDoctorAppointments);
router.get('/', protect, authorize('admin'), appointmentController.getAllAppointments);

module.exports = router;
