const { query } = require('../config/database');
const bcrypt = require('bcrypt');

/**
 * User Model
 * Handles database operations for the 'users' table.
 */
class User {
  /**
   * Find a user by email
   * @param {string} email - User email address
   * @returns {Object|null} - User record or null
   */
  static async findByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  /**
   * Create a new user
   * @param {Object} userData - User details (email, password, role, name)
   * @returns {Object} - Created user record
   */
  static async create({ email, password, role, name }) {
    // Hash password before storing
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await query(
      'INSERT INTO users (email, password_hash, role, name) VALUES ($1, $2, $3, $4) RETURNING id, email, role, name, created_at',
      [email, passwordHash, role, name]
    );
    return result.rows[0];
  }

  /**
   * Find a user by ID
   * @param {number} id - User ID
   * @returns {Object|null} - User record or null
   */
  static async findById(id) {
    const result = await query('SELECT id, email, role, name, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  /**
   * Update user details
   * @param {number} id - User ID
   * @param {Object} updateData - Data to update (e.g., name)
   * @returns {Object} - Updated user record
   */
  static async update(id, { name }) {
    const result = await query(
      'UPDATE users SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, role, name, updated_at',
      [name, id]
    );
    return result.rows[0];
  }

  /**
   * Compare passwords for login
   * @param {string} candidatePassword - Password from user input
   * @param {string} userPassword - Hashed password from database
   * @returns {boolean} - True if passwords match
   */
  static async comparePassword(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
  }
}

module.exports = User;
