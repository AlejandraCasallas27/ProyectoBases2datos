const database = require('../config/database');

async function findPetById(petId) {
  const [rows] = await database.execute(
    `SELECT pet_id, owner_id
     FROM pet
     WHERE pet_id = ?`,
    [petId]
  );

  return rows[0] || null;
}

async function findServiceById(serviceId) {
  const [rows] = await database.execute(
    `SELECT
       service_id,
       veterinarian_name,
       duration_minutes,
       price,
       is_active
     FROM service
     WHERE service_id = ?`,
    [serviceId]
  );

  return rows[0] || null;
}

async function findScheduleConflicts(
  veterinarianName,
  scheduledAt,
  durationMinutes
) {
  const [rows] = await database.execute(
    `SELECT appointment_id
     FROM appointment
     WHERE veterinarian_name = ?
       AND status = 'scheduled'
       AND scheduled_at < DATE_ADD(?, INTERVAL ? MINUTE)
       AND DATE_ADD(scheduled_at, INTERVAL duration_minutes MINUTE) > ?
     LIMIT 1`,
    [
      veterinarianName,
      scheduledAt,
      durationMinutes,
      scheduledAt
    ]
  );

  return rows.length > 0;
}

async function createAppointment(data) {
  const [result] = await database.execute(
    `INSERT INTO appointment (
       pet_id,
       service_id,
       veterinarian_name,
       scheduled_at,
       duration_minutes,
       agreed_price,
       status
     )
     VALUES (?, ?, ?, ?, ?, ?, 'scheduled')`,
    [
      data.petId,
      data.serviceId,
      data.veterinarianName,
      data.scheduledAt,
      data.durationMinutes,
      data.agreedPrice
    ]
  );

  return result.insertId;
}

async function createAppointmentSafely(data) {
  const connection = await database.getConnection();

  try {
    await connection.beginTransaction();

    const [veterinarians] = await connection.execute(
      `SELECT service_id
       FROM service
       WHERE veterinarian_name = ?
       ORDER BY service_id
       FOR UPDATE`,
      [data.veterinarianName]
    );

    if (veterinarians.length === 0) {
      const error = new Error('Veterinarian is not available');
      error.statusCode = 409;
      throw error;
    }

    const [conflicts] = await connection.execute(
      `SELECT appointment_id
       FROM appointment
       WHERE veterinarian_name = ?
         AND status = 'scheduled'
         AND scheduled_at < DATE_ADD(?, INTERVAL ? MINUTE)
         AND DATE_ADD(scheduled_at, INTERVAL duration_minutes MINUTE) > ?
       LIMIT 1`,
      [
        data.veterinarianName,
        data.scheduledAt,
        data.durationMinutes,
        data.scheduledAt
      ]
    );

    if (conflicts.length > 0) {
      const error = new Error(
        'The veterinarian already has an appointment at this time'
      );
      error.statusCode = 409;
      throw error;
    }

    const [result] = await connection.execute(
      `INSERT INTO appointment (
         pet_id,
         service_id,
         veterinarian_name,
         scheduled_at,
         duration_minutes,
         agreed_price,
         status
       )
       VALUES (?, ?, ?, ?, ?, ?, 'scheduled')`,
      [
        data.petId,
        data.serviceId,
        data.veterinarianName,
        data.scheduledAt,
        data.durationMinutes,
        data.agreedPrice
      ]
    );

    await connection.commit();

    return result.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function findById(appointmentId) {
  const [rows] = await database.execute(
    `SELECT
       appointment_id AS appointmentId,
       pet_id AS petId,
       service_id AS serviceId,
       veterinarian_name AS veterinarianName,
       scheduled_at AS scheduledAt,
       duration_minutes AS durationMinutes,
       agreed_price AS agreedPrice,
       status
     FROM appointment
     WHERE appointment_id = ?`,
    [appointmentId]
  );

  return rows[0] || null;
}

async function findUpcomingByPetId(petId) {
  const [rows] = await database.execute(
    `SELECT
       appointment.appointment_id AS appointmentId,
       appointment.pet_id AS petId,
       appointment.service_id AS serviceId,
       service.name AS serviceName,
       appointment.veterinarian_name AS veterinarianName,
       appointment.scheduled_at AS scheduledAt,
       appointment.duration_minutes AS durationMinutes,
       appointment.agreed_price AS agreedPrice,
       appointment.status
     FROM appointment AS appointment
     INNER JOIN service AS service
       ON appointment.service_id = service.service_id
     WHERE appointment.pet_id = ?
       AND appointment.status = 'scheduled'
       AND appointment.scheduled_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 5 HOUR)
     ORDER BY appointment.scheduled_at ASC`,
    [petId]
  );

  return rows;
}


async function findCompletedByPetId(petId) {
  const [rows] = await database.execute(
    `SELECT
       appointment.appointment_id AS appointmentId,
       appointment.pet_id AS petId,
       appointment.service_id AS serviceId,
       service.name AS serviceName,
       appointment.veterinarian_name AS veterinarianName,
       appointment.scheduled_at AS scheduledAt,
       appointment.duration_minutes AS durationMinutes,
       appointment.agreed_price AS agreedPrice,
       appointment.status
     FROM appointment AS appointment
     INNER JOIN service AS service
       ON appointment.service_id = service.service_id
     WHERE appointment.pet_id = ?
       AND appointment.status = 'completed'
     ORDER BY appointment.scheduled_at DESC`,
    [petId]
  );

  return rows;
}


async function completeAppointment(appointmentId) {
  const [result] = await database.execute(
    `UPDATE appointment
     SET status = 'completed'
     WHERE appointment_id = ?
       AND status = 'scheduled'
       AND scheduled_at <= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 5 HOUR)`,
    [appointmentId]
  );

  return result.affectedRows;
}


async function findAppointmentsByDate(date) {
  const [rows] = await database.execute(
    `SELECT
       appointment.appointment_id AS appointmentId,
       appointment.scheduled_at AS scheduledAt,
       appointment.status,
       appointment.veterinarian_name AS veterinarianName,
       appointment.duration_minutes AS durationMinutes,
       appointment.agreed_price AS agreedPrice,
       service.name AS serviceName,
       pet.pet_id AS petId,
       pet.name AS petName,
       owner.user_id AS ownerId,
       owner.full_name AS ownerName,
       owner.email AS ownerEmail
     FROM appointment AS appointment
     INNER JOIN service AS service
       ON appointment.service_id = service.service_id
     INNER JOIN pet AS pet
       ON appointment.pet_id = pet.pet_id
     INNER JOIN user AS owner
       ON pet.owner_id = owner.user_id
     WHERE appointment.scheduled_at >= ?
       AND appointment.scheduled_at < DATE_ADD(?, INTERVAL 1 DAY)
     ORDER BY appointment.scheduled_at ASC, appointment.appointment_id ASC`,
    [date, date]
  );

  return rows;
}


module.exports = {
  findPetById,
  findServiceById,
  findScheduleConflicts,
  createAppointment,
  createAppointmentSafely,
  findById,
  findUpcomingByPetId,
  findCompletedByPetId,
    findAppointmentsByDate,
  completeAppointment
};