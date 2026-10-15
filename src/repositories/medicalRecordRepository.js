const database = require('../config/database');

async function findPetById(petId) {
  const [pets] = await database.execute('SELECT pet_id, owner_id FROM pet WHERE pet_id = ?', [petId]);
  return pets[0] || null;
}

function formatRecord(record) {
  if (!record) return null;
  const details = typeof record.details === 'string' ? JSON.parse(record.details) : record.details;
  return { medicalRecordId: record.medicalRecordId, petId: record.petId,
    recordType: record.recordType, veterinarianName: record.veterinarianName,
    recordedAt: record.recordedAt, notes: record.notes, ...details };
}

async function createMedicalRecord(data) {
  const detailsByType = {
    vaccination: ['vaccineName', 'applicationDate', 'nextDoseDate'],
    treatment: ['medicationName', 'dosage', 'frequency', 'durationDays'],
    laboratory_test: ['testName', 'resultValue', 'referenceMin', 'referenceMax', 'unit']
  };
  const details = {};
  for (const field of detailsByType[data.recordType]) details[field] = data[field] ?? null;
  const [result] = await database.execute(
    `INSERT INTO medical_record (pet_id, record_type, veterinarian_name, recorded_at, notes, details)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.petId, data.recordType, data.veterinarianName, data.recordedAt, data.notes, JSON.stringify(details)]
  );
  return result.insertId;
}

const recordColumns = `medical_record_id AS medicalRecordId, pet_id AS petId,
  record_type AS recordType, veterinarian_name AS veterinarianName,
  recorded_at AS recordedAt, notes, details`;

async function findById(medicalRecordId) {
  const [records] = await database.execute(
    `SELECT ${recordColumns} FROM medical_record WHERE medical_record_id = ?`, [medicalRecordId]);
  return formatRecord(records[0]);
}

async function findByPetId(petId) {
  const [records] = await database.execute(
    `SELECT ${recordColumns} FROM medical_record WHERE pet_id = ? ORDER BY recorded_at DESC, medical_record_id DESC`, [petId]);
  return records.map(formatRecord);
}

module.exports = { findPetById, createMedicalRecord, findById, findByPetId };
