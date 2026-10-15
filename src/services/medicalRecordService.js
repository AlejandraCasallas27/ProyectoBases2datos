
const medicalRecordRepository = require('../repositories/medicalRecordRepository');

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

function requiredText(value, fieldName, maxLength) {
  if (
    typeof value !== 'string' ||
    !value.trim() ||
    value.trim().length > maxLength
  ) {
    throw createError(
      `${fieldName} is required and cannot exceed ${maxLength} characters`,
      400
    );
  }

  return value.trim();
}

function optionalText(value, fieldName, maxLength) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'string' || value.trim().length > maxLength) {
    throw createError(`Invalid ${fieldName}`, 400);
  }

  return value.trim() || null;
}

function validateDate(value, fieldName, optional = false) {
  if (optional && (value === undefined || value === null)) {
    return null;
  }

  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    throw createError(
      `${fieldName} must use YYYY-MM-DD format`,
      400
    );
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw createError(`Invalid ${fieldName}`, 400);
  }

  return value;
}

function validateDateTime(value) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)
  ) {
    throw createError(
      'recordedAt must use YYYY-MM-DDTHH:mm:ss format',
      400
    );
  }

  const normalized = value.replace('T', ' ');

  const [datePart, timePart] = value.split('T');
  const [hours, minutes, seconds] = timePart.split(':').map(Number);

  validateDate(datePart, 'recordedAt date');

  if (hours > 23 || minutes > 59 || seconds > 59) {
    throw createError('Invalid recordedAt time', 400);
  }

  return normalized;
}

function validateDecimal(value, fieldName, optional = false) {
  if (optional && (value === undefined || value === null)) {
    return null;
  }

  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    Math.abs(value) > 99999999.99 ||
    !Number.isInteger(value * 100)
  ) {
    throw createError(
      `${fieldName} must be a valid number with up to two decimal places`,
      400
    );
  }

  return value;
}

function validateMedicalRecord(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw createError('Medical record data is required', 400);
  }

  const recordTypes = [
    'vaccination',
    'treatment',
    'laboratory_test'
  ];

  if (!recordTypes.includes(data.recordType)) {
    throw createError('Invalid medical record type', 400);
  }

  const result = {
    petId: validateId(data.petId, 'pet ID'),
    recordType: data.recordType,
    veterinarianName: requiredText(
      data.veterinarianName,
      'Veterinarian name',
      120
    ),
    recordedAt: validateDateTime(data.recordedAt),
    notes: optionalText(data.notes, 'notes', 5000)
  };

  if (data.recordType === 'vaccination') {
    result.vaccineName = requiredText(
      data.vaccineName,
      'Vaccine name',
      150
    );

    result.applicationDate = validateDate(
      data.applicationDate,
      'applicationDate'
    );

    result.nextDoseDate = validateDate(
      data.nextDoseDate,
      'nextDoseDate',
      true
    );

    if (
      result.nextDoseDate &&
      result.nextDoseDate < result.applicationDate
    ) {
      throw createError(
        'Next dose date cannot be before application date',
        400
      );
    }
  }

  if (data.recordType === 'treatment') {
    result.medicationName = requiredText(
      data.medicationName,
      'Medication name',
      150
    );

    result.dosage = requiredText(
      data.dosage,
      'Dosage',
      100
    );

    result.frequency = requiredText(
      data.frequency,
      'Frequency',
      100
    );

    if (
      !Number.isInteger(data.durationDays) ||
      data.durationDays <= 0 ||
      data.durationDays > 65535
    ) {
      throw createError(
        'Duration days must be a positive integer',
        400
      );
    }

    result.durationDays = data.durationDays;
  }

  if (data.recordType === 'laboratory_test') {
    result.testName = requiredText(
      data.testName,
      'Test name',
      150
    );

    result.resultValue = validateDecimal(
      data.resultValue,
      'resultValue'
    );

    result.referenceMin = validateDecimal(
      data.referenceMin,
      'referenceMin',
      true
    );

    result.referenceMax = validateDecimal(
      data.referenceMax,
      'referenceMax',
      true
    );

    if (
      result.referenceMin !== null &&
      result.referenceMax !== null &&
      result.referenceMin > result.referenceMax
    ) {
      throw createError(
        'Reference minimum cannot exceed reference maximum',
        400
      );
    }

    result.unit = requiredText(
      data.unit,
      'Unit',
      50
    );
  }

  return result;
}

async function createMedicalRecord(data) {
  const validatedData = validateMedicalRecord(data);

  const pet = await medicalRecordRepository.findPetById(
    validatedData.petId
  );

  if (!pet) {
    throw createError('Pet not found', 404);
  }

  const medicalRecordId =
    await medicalRecordRepository.createMedicalRecord(
      validatedData
    );

  return medicalRecordRepository.findById(medicalRecordId);
}

async function getMedicalRecords(user, petIdValue) {
  const petId = validateId(petIdValue, 'pet ID');

  const pet = await medicalRecordRepository.findPetById(petId);

  if (!pet) {
    throw createError('Pet not found', 404);
  }

  if (
    user.role !== 'admin' &&
    Number(pet.owner_id) !== Number(user.userId)
  ) {
    throw createError(
      'You cannot access this pet medical history',
      403
    );
  }

  return medicalRecordRepository.findByPetId(petId);
}

module.exports = {
  createMedicalRecord,
  getMedicalRecords
};
