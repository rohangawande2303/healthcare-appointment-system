const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { query } = require('../config/database');

/**
 * User Management Routes
 * 
 * Protected Routes:
 * - PUT /api/users/profile : Update current user profile (All roles)
 * - GET /api/users/admin-test : Test route for RBAC (Admin only)
 */

router.put('/profile', protect, authController.updateProfile);

// Admin: List all users
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// RBAC Test Route: Only admins can access this
router.get('/admin-test', protect, authorize('admin'), (req, res) => {
  res.json({ success: true, message: 'Welcome Admin! RBAC is working perfectly.' });
});

module.exports = router;
