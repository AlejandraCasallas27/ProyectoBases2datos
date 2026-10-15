
const database = require('../config/database');

async function findByEmail(email) {
  const [rows] = await database.execute(
    'SELECT user_id, full_name, email, role FROM user WHERE email = ?',
    [email]
  );

  return rows[0] || null;
}

async function createUser(fullName, email, password) {
  const [result] = await database.execute(
    'INSERT INTO user (full_name, email, password, role) VALUES (?, ?, ?, ?)',
    [fullName, email, password, 'owner']
  );

  return result.insertId;
}

async function findCredentialsByEmail(email) {
  const [rows] = await database.execute(
    'SELECT user_id, full_name, email, password, role, is_active FROM user WHERE email = ?',
    [email]
  );

  return rows[0] || null;
}


async function findById(userId) {
  const [rows] = await database.execute(
    `SELECT user_id, full_name, email, role, is_active
     FROM user
     WHERE user_id = ?`,
    [userId]
  );

  return rows[0] || null;
}


async function findUsers(search) {
  const pattern = `%${search}%`;

  const [rows] = await database.execute(
    `SELECT
       user_id AS userId,
       full_name AS fullName,
       email,
       role,
       is_active AS isActive,
       created_at AS createdAt
     FROM user
     WHERE full_name LIKE ?
        OR email LIKE ?
     ORDER BY user_id DESC`,
    [pattern, pattern]
  );

  return rows;
}

async function findUserById(userId) {
  const [rows] = await database.execute(
    `SELECT
       user_id AS userId,
       full_name AS fullName,
       email,
       role,
       is_active AS isActive
     FROM user
     WHERE user_id = ?`,
    [userId]
  );

  return rows[0] || null;
}

async function updateUserStatus(userId, isActive) {
  const [result] = await database.execute(
    `UPDATE user
     SET is_active = ?
     WHERE user_id = ?`,
    [isActive, userId]
  );

  return result.affectedRows;
}

module.exports = {
  findByEmail,
  createUser,
  findCredentialsByEmail,
  findById,
  findUsers,
  findUserById,
  updateUserStatus
};
