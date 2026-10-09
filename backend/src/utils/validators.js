const Joi = require('joi');

/**
 * Validation Schemas for Authentication and User Data
 * 
 * Rules:
 * - Email: Must be a valid email format
 * - Password: Min 8 chars, 1 uppercase, 1 special character
 * - Role: Must be 'patient', 'doctor', or 'admin'
 */

const authValidators = {
  /**
   * Registration Validation Schema
   */
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[A-Z])(?=.*[!@#$%^&*])'))
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter and one special character',
        'any.required': 'Password is required'
      }),
    name: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'any.required': 'Name is required'
    }),
    role: Joi.string().valid('patient', 'doctor', 'admin').required().messages({
      'any.only': 'Role must be either patient, doctor, or admin',
      'any.required': 'User role is required'
    })
  }),

  /**
   * Login Validation Schema
   */
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

module.exports = {
  authValidators
};
