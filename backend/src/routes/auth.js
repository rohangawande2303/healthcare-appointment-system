const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

/**
 * Authentication Routes
 * 
 * Public Routes:
 * - POST /api/auth/register : Register new user
 * - POST /api/auth/login    : Login existing user
 * 
 * Protected Routes:
 * - GET /api/auth/me        : Get current user profile (requires token)
 */

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);

module.exports = router;
