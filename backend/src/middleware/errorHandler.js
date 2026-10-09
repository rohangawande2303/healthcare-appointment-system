/**
 * Global Error Handler Middleware
 * This middleware catches all errors thrown in the application and sends a 
 * structured JSON response to the client. It also logs the error for debugging.
 * 
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Log error for developers (structured logging)
  console.error(`[ERROR] ${req.method} ${req.url} - ${new Date().toISOString()}`);
  console.error(`Message: ${message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Handle specific database errors (PostgreSQL)
  if (err.code === '23505') { // Unique violation
    statusCode = 400;
    message = 'Duplicate entry found. This record already exists.';
  }

  // Send structured response
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;
