const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const jwt = require('jsonwebtoken');
const { authValidators } = require('../utils/validators');

/**
 * Generate JWT Token
 * @param {Object} user - User object
 * @returns {string} - Signed JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Auth Controller
 * Handles user registration, login, and profile management.
 */
const authController = {
  /**
   * Register a new user
   * Handles separate registration for patients and doctors.
   */
  register: async (req, res, next) => {
    try {
      // 1. Validate input
      const { error } = authValidators.register.validate(req.body, { allowUnknown: true });
      if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
      }

      const { email, password, role, name, ...additionalData } = req.body;

      // 2. Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }

      // 3. Create basic user record
      const user = await User.create({ email, password, role, name });

      // 4. Create role-specific profile
      if (role === 'doctor') {
        await Doctor.create(user.id, additionalData);
      } else if (role === 'patient') {
        await Patient.create(user.id, additionalData);
      }

      // 5. Generate token and send response
      const token = generateToken(user);

      console.log(`[AUTH] New user registered: ${email} (${role})`);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      console.error(`[AUTH] Registration error: ${err.message}`);
      next(err);
    }
  },

  /**
   * Login existing user
   */
  login: async (req, res, next) => {
    try {
      // 1. Validate input
      const { error } = authValidators.login.validate(req.body);
      if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
      }

      const { email, password } = req.body;

      // 2. Find user
      const user = await User.findByEmail(email);
      if (!user) {
        console.warn(`[AUTH] Login attempt failed: User not found (${email})`);
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // 3. Check password
      const isMatch = await User.comparePassword(password, user.password_hash);
      if (!isMatch) {
        console.warn(`[AUTH] Login attempt failed: Invalid password (${email})`);
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // 4. Generate token and send response
      const token = generateToken(user);

      console.log(`[AUTH] User logged in: ${email}`);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      console.error(`[AUTH] Login error: ${err.message}`);
      next(err);
    }
  },

  /**
   * Get current user profile
   */
  getMe: async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      let profileData = {};
      if (user.role === 'doctor') {
        profileData = await Doctor.findByUserId(user.id);
      } else if (user.role === 'patient') {
        profileData = await Patient.findByUserId(user.id);
      }

      res.status(200).json({
        success: true,
        user: { ...user, profile: profileData }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { name, ...profileData } = req.body;

      // 1. Update basic user info
      const updatedUser = await User.update(userId, { name });

      // 2. Update role-specific profile
      let updatedProfile = {};
      if (updatedUser.role === 'doctor') {
        updatedProfile = await Doctor.update(userId, profileData);
      } else if (updatedUser.role === 'patient') {
        updatedProfile = await Patient.update(userId, profileData);
      }

      console.log(`[AUTH] User profile updated: ${updatedUser.email}`);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: { ...updatedUser, profile: updatedProfile }
      });
    } catch (err) {
      console.error(`[AUTH] Profile update error: ${err.message}`);
      next(err);
    }
  }
};

module.exports = authController;
