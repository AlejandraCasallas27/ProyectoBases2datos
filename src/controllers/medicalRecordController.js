
const medicalRecordService = require('../services/medicalRecordService');

async function createMedicalRecord(req, res, next) {
  try {
    const record = await medicalRecordService.createMedicalRecord(
      req.body
    );

    return res.status(201).json({
      message: 'Medical record created successfully',
      data: record
    });
  } catch (error) {
    next(error);
  }
}

async function getMedicalRecords(req, res, next) {
  try {
    const records = await medicalRecordService.getMedicalRecords(
      req.user,
      req.params.petId
    );

    return res.status(200).json({
      message: 'Medical records retrieved successfully',
      data: records
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createMedicalRecord,
  getMedicalRecords
};
