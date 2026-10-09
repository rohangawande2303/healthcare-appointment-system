const { query } = require('../config/database');

/**
 * Reminder Controller
 * Handles CRUD for medicine reminders.
 */
const reminderController = {
  /**
   * Create a new reminder
   * POST /api/reminders
   */
  createReminder: async (req, res, next) => {
    try {
      const { medicine_name, dosage, frequency, start_date, end_date, reminder_times_json } = req.body;
      
      const patient_id_result = await query('SELECT id FROM patients WHERE user_id = $1', [req.user.id]);
      if (patient_id_result.rows.length === 0) {
        return res.status(403).json({ success: false, message: 'Only patients can create reminders' });
      }
      const patient_id = patient_id_result.rows[0].id;

      const result = await query(
        'INSERT INTO medicine_reminders (patient_id, medicine_name, dosage, frequency, start_date, end_date, reminder_times_json) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [patient_id, medicine_name, dosage, frequency, start_date, end_date, JSON.stringify(reminder_times_json)]
      );

      res.status(201).json({
        success: true,
        message: 'Reminder created successfully',
        data: result.rows[0]
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get all reminders for a patient
   * GET /api/reminders/patient/:id
   */
  getPatientReminders: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await query(`
        SELECT r.* 
        FROM medicine_reminders r
        JOIN patients p ON r.patient_id = p.id
        WHERE p.user_id = $1
        ORDER BY r.created_at DESC
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
   * Toggle reminder status (active/inactive)
   * PUT /api/reminders/:id/toggle
   */
  toggleStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      const result = await query(
        'UPDATE medicine_reminders SET is_active = $1 WHERE id = $2 RETURNING *',
        [is_active, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Reminder not found' });
      }

      res.status(200).json({
        success: true,
        data: result.rows[0]
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Delete a reminder
   * DELETE /api/reminders/:id
   */
  deleteReminder: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await query('DELETE FROM medicine_reminders WHERE id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Reminder not found' });
      }

      res.status(200).json({
        success: true,
        message: 'Reminder deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = reminderController;
