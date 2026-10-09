const { query } = require('../config/database');

/**
 * Doctor Model
 * Handles database operations for the 'doctors' table.
 */
class Doctor {
  /**
   * Create a new doctor profile
   * @param {number} userId - ID from users table
   * @param {Object} doctorData - Specialty, qualification, experience, fee
   * @returns {Object} - Created doctor record
   */
  static async create(userId, { specialty, qualification, experience, consultation_fee }) {
    const result = await query(
      'INSERT INTO doctors (user_id, specialty, qualification, experience, consultation_fee) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, specialty, qualification, experience, consultation_fee]
    );
    return result.rows[0];
  }

  /**
   * Find doctor by user ID
   * @param {number} userId - ID from users table
   * @returns {Object|null} - Doctor record or null
   */
  static async findByUserId(userId) {
    const result = await query(
      'SELECT d.*, u.name, u.email FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.id = $1',
      [userId]
    );
    return result.rows[0];
  }

  /**
   * Update doctor profile
   * @param {number} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object} - Updated record
   */
  static async update(userId, { specialty, qualification, experience, consultation_fee }) {
    const result = await query(
      'UPDATE doctors SET specialty = $1, qualification = $2, experience = $3, consultation_fee = $4 WHERE user_id = $5 RETURNING *',
      [specialty, qualification, experience, consultation_fee, userId]
    );
    return result.rows[0];
  }
}

module.exports = Doctor;
