
const appointmentRepository = require('../repositories/appointmentRepository');

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function validateId(value, fieldName) {
  if (
    typeof value !== 'number' ||
    !Number.isSafeInteger(value) ||
    value <= 0 ||
    value > 4294967295
  ) {
    throw createError(`Invalid ${fieldName}`, 400);
  }

  return value;
}

function validateScheduledAt(value) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)
  ) {
    throw createError(
      'Scheduled date must use YYYY-MM-DDTHH:mm:ss format',
      400
    );
  }

  const [datePart, timePart] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);

  const parsedDate = new Date(
    Date.UTC(year, month - 1, day, hour, minute, second)
  );

  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day ||
    parsedDate.getUTCHours() !== hour ||
    parsedDate.getUTCMinutes() !== minute ||
    parsedDate.getUTCSeconds() !== second
  ) {
    throw createError('Invalid scheduled date', 400);
  }

  const colombiaTime = new Date(Date.now() - 5 * 60 * 60 * 1000);

  if (parsedDate.getTime() <= colombiaTime.getTime()) {
    throw createError('Appointment date must be in the future', 400);
  }

  return value.replace('T', ' ');
}

async function createAppointment(ownerId, data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw createError('Appointment data is required', 400);
  }

  const petId = validateId(data.petId, 'pet ID');
  const serviceId = validateId(data.serviceId, 'service ID');
  const scheduledAt = validateScheduledAt(data.scheduledAt);

  const pet = await appointmentRepository.findPetById(petId);

  if (!pet) {
    throw createError('Pet not found', 404);
  }

  if (pet.owner_id !== ownerId) {
    throw createError(
      'You cannot book appointments for this pet',
      403
    );
  }

  const service = await appointmentRepository.findServiceById(serviceId);

  if (!service) {
    throw createError('Service not found', 404);
  }

  if (!service.is_active) {
    throw createError('Service is not available', 409);
  }

  const appointmentId =
    await appointmentRepository.createAppointmentSafely({
      petId,
      serviceId,
      veterinarianName: service.veterinarian_name,
      scheduledAt,
      durationMinutes: service.duration_minutes,
      agreedPrice: service.price
    });

  return appointmentRepository.findById(appointmentId);
}


async function getUpcomingAppointments(ownerId, petIdValue) {
  const petId = validateId(Number(petIdValue), 'pet ID');

  const pet = await appointmentRepository.findPetById(petId);

  if (!pet) {
    throw createError('Pet not found', 404);
  }

  if (pet.owner_id !== ownerId) {
    throw createError(
      'You cannot access appointments for this pet',
      403
    );
  }

  return appointmentRepository.findUpcomingByPetId(petId);
}


async function getCompletedAppointments(ownerId, petIdValue) {
  const petId = validateId(Number(petIdValue), 'pet ID');

  const pet = await appointmentRepository.findPetById(petId);

  if (!pet) {
    throw createError('Pet not found', 404);
  }

  if (pet.owner_id !== ownerId) {
    throw createError(
      'You cannot access appointments for this pet',
      403
    );
  }

  return appointmentRepository.findCompletedByPetId(petId);
}


async function completeAppointment(appointmentIdValue) {
  const appointmentId = validateId(
    Number(appointmentIdValue),
    'appointment ID'
  );

  const appointment = await appointmentRepository.findById(appointmentId);

  if (!appointment) {
    throw createError('Appointment not found', 404);
  }

  if (appointment.status !== 'scheduled') {
    throw createError(
      'Only scheduled appointments can be completed',
      409
    );
  }

  const affectedRows =
    await appointmentRepository.completeAppointment(appointmentId);

  if (affectedRows === 0) {
    throw createError(
      'Appointment cannot be completed before its scheduled time',
      409
    );
  }

  return appointmentRepository.findById(appointmentId);
}


async function getAppointmentsByDate(dateValue) {
  if (
    typeof dateValue !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)
  ) {
    throw createError('Date must use YYYY-MM-DD format', 400);
  }

  const date = new Date(`${dateValue}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== dateValue
  ) {
    throw createError('Invalid date', 400);
  }

  return appointmentRepository.findAppointmentsByDate(dateValue);
}


module.exports = {
  createAppointment,
  getUpcomingAppointments,
  getCompletedAppointments,
    getAppointmentsByDate,
  completeAppointment
};
