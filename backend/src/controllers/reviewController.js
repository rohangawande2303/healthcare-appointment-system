const { query } = require('../config/database');

/**
 * Review Controller
 * Handles doctor ratings and patient feedback.
 */
const reviewController = {
  /**
   * Submit a new review
   * POST /api/reviews
   */
  createReview: async (req, res, next) => {
    try {
      const { doctor_id, rating, comment } = req.body;
      
      const patient_id_result = await query('SELECT id FROM patients WHERE user_id = $1', [req.user.id]);
      if (patient_id_result.rows.length === 0) {
        return res.status(403).json({ success: false, message: 'Only patients can leave reviews' });
      }
      const patient_id = patient_id_result.rows[0].id;

      // 1. Verify that the patient has had a completed appointment with this doctor
      const appointmentCheck = await query(
        "SELECT id FROM appointments WHERE patient_id = $1 AND doctor_id = $2 AND status = 'completed'",
        [patient_id, doctor_id]
      );

      if (appointmentCheck.rows.length === 0) {
        return res.status(403).json({ success: false, message: 'You can only review doctors you have consulted with' });
      }

      // 2. Insert review
      const result = await query(
        'INSERT INTO reviews (doctor_id, patient_id, rating, comment) VALUES ($1, $2, $3, $4) ON CONFLICT (doctor_id, patient_id) DO UPDATE SET rating = $3, comment = $4 RETURNING *',
        [doctor_id, patient_id, rating, comment]
      );

      res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: result.rows[0]
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get reviews for a doctor
   * GET /api/reviews/doctor/:id
   */
  getDoctorReviews: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const result = await query(`
        SELECT r.*, u.name as patient_name 
        FROM reviews r 
        JOIN patients p ON r.patient_id = p.id 
        JOIN users u ON p.user_id = u.id 
        WHERE r.doctor_id = $1
        ORDER BY r.created_at DESC
      `, [id]);

      // Calculate average rating
      const stats = await query(
        'SELECT AVG(rating)::numeric(2,1) as average, COUNT(*) as count FROM reviews WHERE doctor_id = $1',
        [id]
      );

      res.status(200).json({
        success: true,
        stats: stats.rows[0],
        data: result.rows
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = reviewController;
