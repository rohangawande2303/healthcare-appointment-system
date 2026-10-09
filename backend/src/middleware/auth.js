const jwt = require('jsonwebtoken');

/**
 * Auth Middleware
 * Verifies the JWT token in the Authorization header.
 * 
 * Usage:
 * Add to any route that requires authentication.
 */
const protect = (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token, return unauthorized
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data to request object
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token is invalid or expired'
    });
  }
};

module.exports = { protect };
