const { query } = require('../config/database');

/**
 * Queue Controller
 * Handles real-time patient queue tracking.
 */
const queueController = {
  /**
   * Get queue status for a doctor
   * GET /api/queue/doctor/:id
   */
  getQueueStatus: async (req, res, next) => {
    try {
      const { id } = req.params; // doctor_id or user_id? We'll use doctor_id.

      // 1. Get queue record
      const queueResult = await query(
        'SELECT q.*, u.name as current_patient_name FROM queue_status q LEFT JOIN patients p ON q.current_patient_id = p.id LEFT JOIN users u ON p.user_id = u.id WHERE q.doctor_id = $1',
        [id]
      );

      // 2. Get today's appointments for this doctor that are 'confirmed'
      const today = new Date().toISOString().split('T')[0];
      const appointmentsResult = await query(
        "SELECT a.id, a.patient_id, u.name as patient_name, a.time_slot FROM appointments a JOIN patients p ON a.patient_id = p.id JOIN users u ON p.user_id = u.id WHERE a.doctor_id = $1 AND a.appointment_date = $2 AND a.status = 'confirmed' ORDER BY a.time_slot ASC",
        [id, today]
      );

      res.status(200).json({
        success: true,
        queue: queueResult.rows[0] || { doctor_id: id, current_patient_id: null, estimated_wait_time: 0 },
        appointments: appointmentsResult.rows
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update queue (Next Patient)
   * PUT /api/queue/update
   */
  updateQueue: async (req, res, next) => {
    try {
      const { doctor_id, current_patient_id, estimated_wait_time } = req.body;

      // Update or Insert queue status
      const result = await query(
        'INSERT INTO queue_status (doctor_id, current_patient_id, estimated_wait_time, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) ON CONFLICT (doctor_id) DO UPDATE SET current_patient_id = $2, estimated_wait_time = $3, updated_at = CURRENT_TIMESTAMP RETURNING *',
        [doctor_id, current_patient_id, estimated_wait_time]
      );

      // Broadcast update via Socket.io
      const io = req.app.get('io');
      if (io) {
        io.emit(`queue-update-${doctor_id}`, result.rows[0]);
      }
      
      res.status(200).json({
        success: true,
        data: result.rows[0]
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = queueController;
