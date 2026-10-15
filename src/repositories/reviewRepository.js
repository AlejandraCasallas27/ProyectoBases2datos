
const database = require('../config/database');

async function findAppointmentById(appointmentId) {
  const [rows] = await database.execute(
    `SELECT
       a.appointment_id AS appointmentId,
       a.status,
       p.owner_id AS ownerId
     FROM appointment a
     INNER JOIN pet p
       ON a.pet_id = p.pet_id
     WHERE a.appointment_id = ?`,
    [appointmentId]
  );

  return rows[0] || null;
}

async function findReviewByAppointmentId(appointmentId) {
  const [rows] = await database.execute(
    `SELECT
       review_id AS reviewId,
       appointment_id AS appointmentId,
       rating,
       comment,
       pet_comfort_level AS petComfortLevel,
       created_at AS createdAt
     FROM review
     WHERE appointment_id = ?`,
    [appointmentId]
  );

  return rows[0] || null;
}

async function findTagsByNames(tagNames) {
  return [];
}

async function findTagsByIds(tagIds) {
  return tagIds.map(tagId => ({ tagId, name: null }));
}

async function createReview(data) {
  const connection = await database.getConnection();

  try {
    await connection.beginTransaction();

    const [appointmentRows] = await connection.execute(
      `SELECT
         a.appointment_id,
         a.status,
         p.owner_id
       FROM appointment a
       INNER JOIN pet p
         ON a.pet_id = p.pet_id
       WHERE a.appointment_id = ?
       FOR UPDATE`,
      [data.appointmentId]
    );

    if (appointmentRows.length === 0) {
      const error = new Error('Appointment not found');
      error.statusCode = 404;
      throw error;
    }

    const appointment = appointmentRows[0];

    if (appointment.owner_id !== data.ownerId) {
      const error = new Error(
        'You cannot review this appointment'
      );
      error.statusCode = 403;
      throw error;
    }

    if (appointment.status !== 'completed') {
      const error = new Error(
        'Only completed appointment can be reviewed'
      );
      error.statusCode = 409;
      throw error;
    }

    const [existingReviews] = await connection.execute(
      `SELECT review_id
       FROM review
       WHERE appointment_id = ?`,
      [data.appointmentId]
    );

    if (existingReviews.length > 0) {
      const error = new Error(
        'This appointment already has a review'
      );
      error.statusCode = 409;
      throw error;
    }

    const [result] = await connection.execute(
      `INSERT INTO review (
         appointment_id,
         rating,
         comment,
         pet_comfort_level,
         tags
       )
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.appointmentId,
        data.rating,
        data.comment,
        data.petComfortLevel,
        JSON.stringify(data.tagIds.map(tagId => ({ tagId, name: null })))
      ]
    );

    const reviewId = result.insertId;

    await connection.commit();

    return reviewId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function findById(reviewId) {
  const [rows] = await database.execute(
    `SELECT
       r.review_id AS reviewId,
       r.appointment_id AS appointmentId,
       r.rating,
       r.comment,
       r.pet_comfort_level AS petComfortLevel,
       r.created_at AS createdAt
     FROM review r
     WHERE r.review_id = ?`,
    [reviewId]
  );

  return rows[0] || null;
}

async function findTagsByReviewId(reviewId) {
  const [reviews] = await database.execute('SELECT tags FROM review WHERE review_id = ?', [reviewId]);
  if (!reviews.length) return [];
  const tags = reviews[0].tags;
  return typeof tags === 'string' ? JSON.parse(tags) : (tags || []);
}

module.exports = {
  findAppointmentById, findReviewByAppointmentId, findTagsByNames,
  findTagsByIds, createReview, findById, findTagsByReviewId
};
