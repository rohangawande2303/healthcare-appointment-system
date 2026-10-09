/**
 * Role Check Middleware
 * Restricts access to routes based on user roles.
 * 
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'doctor')
 * @returns {Function} - Middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user is attached by the 'protect' middleware
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user?.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { authorize };
