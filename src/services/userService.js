
const userRepository = require('../repositories/userRepository');

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function validateId(value, fieldName) {
  const number = Number(value);

  if (
    !Number.isSafeInteger(number) ||
    number <= 0 ||
    number > 4294967295
  ) {
    throw createError(`Invalid ${fieldName}`, 400);
  }

  return number;
}

function validateSearch(search) {
  if (search === undefined) {
    return '';
  }

  if (
    typeof search !== 'string' ||
    search.length > 150
  ) {
    throw createError('Invalid search parameter', 400);
  }

  return search.trim();
}

function validateText(value, fieldName, maxLength) {
  if (
    typeof value !== 'string' ||
    !value.trim() ||
    value.trim().length > maxLength
  ) {
    throw createError(`Invalid ${fieldName}`, 400);
  }

  return value.trim();
}

function validateBirthDate(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    throw createError('Invalid birth date', 400);
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw createError('Invalid birth date', 400);
  }

  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());

  if (value > today) {
    throw createError('Birth date cannot be in the future', 400);
  }

  return value;
}


async function registerOwner(data) {
  const { fullName, email, password } = data || {};

  if (
    typeof fullName !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string'
  ) {
    const error = new Error('Full name, email and password are required');
    error.statusCode = 400;
    throw error;
  }

  const normalizedName = fullName.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedName || !normalizedEmail || !password) {
    const error = new Error('All registration fields are required');
    error.statusCode = 400;
    throw error;
  }

  if (normalizedName.length > 120 || normalizedEmail.length > 150) {
    const error = new Error('Name or email exceeds the allowed length');
    error.statusCode = 400;
    throw error;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalizedEmail)) {
    const error = new Error('Invalid email format');
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 8 || password.length > 255) {
    const error = new Error('Password must contain between 8 and 255 characters');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await userRepository.findByEmail(normalizedEmail);

  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 409;
    throw error;
  }

  try {
    const userId = await userRepository.createUser(
      normalizedName,
      normalizedEmail,
      password
    );

    return {
      userId,
      fullName: normalizedName,
      email: normalizedEmail,
      role: 'owner'
    };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const conflict = new Error('Email is already registered');
      conflict.statusCode = 409;
      throw conflict;
    }

    throw error;
  }
}

async function getUsers(search) {
  return userRepository.findUsers(validateSearch(search));
}

async function changeUserStatus(
  currentUserId,
  userIdValue,
  data
) {
  const userId = validateId(userIdValue, 'user ID');

  if (
    !data ||
    typeof data.isActive !== 'boolean'
  ) {
    throw createError('isActive must be a boolean', 400);
  }

  const user = await userRepository.findUserById(userId);

  if (!user) {
    throw createError('User not found', 404);
  }

  if (
    userId === Number(currentUserId) &&
    data.isActive === false
  ) {
    throw createError(
      'You cannot deactivate your own account',
      409
    );
  }

  await userRepository.updateUserStatus(
    userId,
    data.isActive
  );

  return userRepository.findUserById(userId);
}

module.exports = {
  registerOwner,
  getUsers,
  changeUserStatus
};
