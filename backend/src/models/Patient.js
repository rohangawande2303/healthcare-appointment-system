const { query } = require('../config/database');

/**
 * Patient Model
 * Handles database operations for the 'patients' table.
 */
class Patient {
  /**
   * Create a new patient profile
   * @param {number} userId - ID from users table
   * @param {Object} patientData - DOB, blood group, medical history
   * @returns {Object} - Created patient record
   */
  static async create(userId, { date_of_birth, blood_group, medical_history_json = {} }) {
    const result = await query(
      'INSERT INTO patients (user_id, date_of_birth, blood_group, medical_history_json) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, date_of_birth, blood_group, JSON.stringify(medical_history_json)]
    );
    return result.rows[0];
  }

  /**
   * Find patient by user ID
   * @param {number} userId - ID from users table
   * @returns {Object|null} - Patient record or null
   */
  static async findByUserId(userId) {
    const result = await query(
      'SELECT p.*, u.name, u.email FROM patients p JOIN users u ON p.user_id = u.id WHERE u.id = $1',
      [userId]
    );
    return result.rows[0];
  }

  /**
   * Update patient profile
   * @param {number} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object} - Updated record
   */
  static async update(userId, { date_of_birth, blood_group, medical_history_json }) {
    const result = await query(
      'UPDATE patients SET date_of_birth = $1, blood_group = $2, medical_history_json = $3 WHERE user_id = $4 RETURNING *',
      [date_of_birth, blood_group, JSON.stringify(medical_history_json), userId]
    );
    return result.rows[0];
  }
}

module.exports = Patient;
