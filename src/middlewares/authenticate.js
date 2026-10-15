
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

async function authenticate(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !/^Bearer \S+$/.test(authorization)) {
    return res.status(401).json({
      error: {
        status: 401,
        message: 'Authentication token is required'
      }
    });
  }

  const token = authorization.slice(7);

  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256']
    });
  } catch (error) {
    return res.status(401).json({
      error: {
        status: 401,
        message: 'Invalid or expired authentication token'
      }
    });
  }

  try {
    if (!Number.isInteger(payload.userId) || payload.userId <= 0) {
      return res.status(401).json({
        error: {
          status: 401,
          message: 'Invalid authentication token'
        }
      });
    }

    const user = await userRepository.findById(payload.userId);

    if (!user) {
      return res.status(401).json({
        error: {
          status: 401,
          message: 'User account not found'
        }
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        error: {
          status: 403,
          message: 'User account is inactive'
        }
      });
    }

    req.user = {
      userId: user.user_id,
      role: user.role
    };

    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = authenticate;
