
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

async function createSession(data) {
  const { email, password } = data || {};

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !email.trim() ||
    !password
  ) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await userRepository.findCredentialsByEmail(normalizedEmail);

  if (!user || user.password !== password) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (!user.is_active) {
    const error = new Error('User account is inactive');
    error.statusCode = 403;
    throw error;
  }

  const token = jwt.sign(
    {
      userId: user.user_id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '2h',
      algorithm: 'HS256'
    }
  );

  return {
    token,
    tokenType: 'Bearer',
    user: {
      userId: user.user_id,
      fullName: user.full_name,
      email: user.email,
      role: user.role
    }
  };
}

module.exports = {
  createSession
};
