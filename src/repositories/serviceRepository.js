
const database = require('../config/database');

async function findAllActive() {
  const [rows] = await database.execute(
    `SELECT
       service_id AS serviceId,
       name,
       description,
       veterinarian_name AS veterinarianName,
       duration_minutes AS durationMinutes,
       price
     FROM service
     WHERE is_active = TRUE
     ORDER BY name ASC`
  );

  return rows;
}

async function findAll() {
  const [rows] = await database.execute(
    `SELECT
       service_id AS serviceId,
       name,
       description,
       veterinarian_name AS veterinarianName,
       duration_minutes AS durationMinutes,
       price,
       is_active AS isActive
     FROM service
     ORDER BY service_id DESC`
  );

  return rows;
}

async function findById(serviceId) {
  const [rows] = await database.execute(
    `SELECT
       service_id AS serviceId,
       name,
       description,
       veterinarian_name AS veterinarianName,
       duration_minutes AS durationMinutes,
       price,
       is_active AS isActive
     FROM service
     WHERE service_id = ?`,
    [serviceId]
  );

  return rows[0] || null;
}

async function createService(data) {
  const [result] = await database.execute(
    `INSERT INTO service
       (name, description, veterinarian_name, duration_minutes, price)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.name,
      data.description,
      data.veterinarianName,
      data.durationMinutes,
      data.price
    ]
  );

  return result.insertId;
}

async function updateService(serviceId, data) {
  const [result] = await database.execute(
    `UPDATE service
     SET name = ?,
         description = ?,
         veterinarian_name = ?,
         duration_minutes = ?,
         price = ?
     WHERE service_id = ?`,
    [
      data.name,
      data.description,
      data.veterinarianName,
      data.durationMinutes,
      data.price,
      serviceId
    ]
  );

  return result.affectedRows;
}

async function deactivateService(serviceId) {
  const [result] = await database.execute(
    `UPDATE service
     SET is_active = FALSE
     WHERE service_id = ?`,
    [serviceId]
  );

  return result.affectedRows;
}

module.exports = {
  findAllActive,
  findAll,
  findById,
  createService,
  updateService,
  deactivateService
};
