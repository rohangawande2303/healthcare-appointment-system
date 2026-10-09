const { query } = require('../config/database');

/**
 * Patient Controller
 * Handles patient profile and medical history.
 */
const patientController = {
  /**
   * Get patient profile
   * GET /api/patients/profile
   */
  getProfile: async (req, res, next) => {
    try {
      const result = await query(
        'SELECT p.*, u.name, u.email FROM patients p JOIN users u ON p.user_id = u.id WHERE u.id = $1',
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Patient profile not found' });
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
   * Update medical history
   * PUT /api/patients/medical-history
   */
  updateMedicalHistory: async (req, res, next) => {
    try {
      const { medical_history_json } = req.body;
      const result = await query(
        'UPDATE patients SET medical_history_json = $1 WHERE user_id = $2 RETURNING *',
        [JSON.stringify(medical_history_json), req.user.id]
      );

      res.status(200).json({
        success: true,
        data: result.rows[0]
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = patientController;
