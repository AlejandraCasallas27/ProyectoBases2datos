
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          status: 401,
          message: 'Authentication is required'
        }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          status: 403,
          message: 'You do not have permission to access this resource'
        }
      });
    }

    return next();
  };
}

module.exports = authorize;
