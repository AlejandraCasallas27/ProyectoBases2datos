
const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = express.Router();

router.post(
  '/',
  authenticate,
  authorize('owner'),
  appointmentController.createAppointment
);

router.get(
  '/pets/:petId/upcoming',
  authenticate,
  authorize('owner'),
  appointmentController.getUpcomingAppointments
);

router.get(
  '/pets/:petId/history',
  authenticate,
  authorize('owner'),
  appointmentController.getCompletedAppointments
);

router.get(
  '/admin/today',
  authenticate,
  authorize('admin'),
  appointmentController.getAppointmentsByDate
);

router.patch(
  '/:appointmentId/completion',
  authenticate,
  authorize('admin'),
  appointmentController.completeAppointment
);

module.exports = router;
