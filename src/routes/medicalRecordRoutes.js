
const express = require('express');
const medicalRecordController = require('../controllers/medicalRecordController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = express.Router();

router.post(
  '/',
  authenticate,
  authorize('admin'),
  medicalRecordController.createMedicalRecord
);

router.get(
  '/pets/:petId',
  authenticate,
  medicalRecordController.getMedicalRecords
);

module.exports = router;
