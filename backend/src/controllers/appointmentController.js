const { query } = require('../config/database');
const emailService = require('../services/emailService');
const User = require('../models/User');

/**
 * Appointment Controller
 * Handles booking, rescheduling, cancellations, and dashboard data.
 */
const appointmentController = {
  /**
   * Book a new appointment
   * POST /api/appointments
   */
  bookAppointment: async (req, res, next) => {
    try {
      const { doctor_id, appointment_date, time_slot, type, notes } = req.body;
      const patient_id_result = await query('SELECT id FROM patients WHERE user_id = $1', [req.user.id]);
      
      if (patient_id_result.rows.length === 0) {
        return res.status(403).json({ success: false, message: 'Only registered patients can book appointments' });
      }
      
      const patient_id = patient_id_result.rows[0].id;

      // 1. Double-booking check (redundant but good for UX)
      const existing = await query(
        'SELECT id FROM appointments WHERE doctor_id = $1 AND appointment_date = $2 AND time_slot = $3 AND status != $4',
        [doctor_id, appointment_date, time_slot, 'cancelled']
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'This slot is already booked' });
      }

      // 2. Create appointment
      const result = await query(
        'INSERT INTO appointments (patient_id, doctor_id, appointment_date, time_slot, type, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [patient_id, doctor_id, appointment_date, time_slot, type || 'in-person', notes]
      );

      // 3. Send Confirmation Email
      try {
        const appointmentData = result.rows[0];
        const doctorInfo = await query('SELECT u.name FROM doctors d JOIN users u ON d.user_id = u.id WHERE d.id = $1', [doctor_id]);
        const userInfo = await User.findById(req.user.id);
        
        await emailService.sendBookingConfirmation(
          { ...appointmentData, doctor_name: doctorInfo.rows[0].name },
          { name: userInfo.name, email: userInfo.email }
        );
      } catch (emailErr) {
        console.error(`[AUTH] Failed to send booking email: ${emailErr.message}`);
      }

      res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
        data: result.rows[0]
      });
    } catch (err) {
      // Handle UNIQUE constraint violation specifically
      if (err.code === '23505') {
        return res.status(400).json({ success: false, message: 'Double-booking detected. This slot was just taken.' });
      }
      next(err);
    }
  },

  /**
   * Get appointments for a patient
   * GET /api/appointments/patient/:id
   */
  getPatientAppointments: async (req, res, next) => {
    try {
      const { id } = req.params; // user_id or patient_id? We'll use patient_id from the model usually, but here we can check user_id.
      
      const result = await query(`
        SELECT a.*, d.specialty, u.name as doctor_name 
        FROM appointments a 
        JOIN doctors d ON a.doctor_id = d.id 
        JOIN users u ON d.user_id = u.id 
        JOIN patients p ON a.patient_id = p.id
        WHERE p.user_id = $1
        ORDER BY a.appointment_date DESC, a.time_slot DESC
      `, [id]);

      res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get appointments for a doctor
   * GET /api/appointments/doctor/:id
   */
  getDoctorAppointments: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const result = await query(`
        SELECT a.*, u.name as patient_name, p.date_of_birth, p.blood_group 
        FROM appointments a 
        JOIN patients p ON a.patient_id = p.id 
        JOIN users u ON p.user_id = u.id 
        JOIN doctors d ON a.doctor_id = d.id
        WHERE d.user_id = $1
        ORDER BY a.appointment_date DESC, a.time_slot DESC
      `, [id]);

      res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Reschedule an appointment
   * PUT /api/appointments/:id/reschedule
   */
  rescheduleAppointment: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { appointment_date, time_slot } = req.body;

      // 1. Check if new slot is available
      const checkResult = await query(
        'SELECT doctor_id FROM appointments WHERE id = $1',
        [id]
      );
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      const doctor_id = checkResult.rows[0].doctor_id;

      const existing = await query(
        'SELECT id FROM appointments WHERE doctor_id = $1 AND appointment_date = $2 AND time_slot = $3 AND id != $4 AND status != $5',
        [doctor_id, appointment_date, time_slot, id, 'cancelled']
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'New slot is already booked' });
      }

      // 2. Update appointment
      const result = await query(
        'UPDATE appointments SET appointment_date = $1, time_slot = $2, status = $3 WHERE id = $4 RETURNING *',
        [appointment_date, time_slot, 'pending', id]
      );

      res.status(200).json({
        success: true,
        message: 'Appointment rescheduled successfully',
        data: result.rows[0]
      });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(400).json({ success: false, message: 'Slot taken during rescheduling.' });
      }
      next(err);
    }
  },

  /**
   * Cancel an appointment
   * DELETE /api/appointments/:id
   */
  cancelAppointment: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const result = await query(
        'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *',
        ['cancelled', id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      res.status(200).json({
        success: true,
        message: 'Appointment cancelled successfully',
        data: result.rows[0]
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update appointment status (Admin/Doctor)
   * PUT /api/appointments/:id/status
   */
  updateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const currentResult = await query('SELECT status FROM appointments WHERE id = $1', [id]);
      if (currentResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      const currentStatus = currentResult.rows[0].status;

      // Prevent changes if already completed or cancelled
      if (currentStatus === 'completed' || currentStatus === 'cancelled') {
        return res.status(400).json({ success: false, message: `Cannot change status from ${currentStatus}` });
      }

      // Allowed transitions
      const allowedTransitions = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['completed', 'cancelled']
      };

      if (!allowedTransitions[currentStatus]?.includes(status)) {
        return res.status(400).json({ success: false, message: `Invalid status transition from ${currentStatus} to ${status}` });
      }

      const result = await query(
        'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
      );

      res.status(200).json({
        success: true,
        message: `Appointment status updated to ${status}`,
        data: result.rows[0]
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get all appointments (Admin)
   * GET /api/appointments
   */
  getAllAppointments: async (req, res, next) => {
    try {
      const result = await query(`
        SELECT a.*, d.specialty, ud.name as doctor_name, up.name as patient_name
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users ud ON d.user_id = ud.id
        JOIN patients p ON a.patient_id = p.id
        JOIN users up ON p.user_id = up.id
        ORDER BY a.appointment_date DESC
      `);

      res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = appointmentController;
