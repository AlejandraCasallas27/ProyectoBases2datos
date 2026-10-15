
const appointmentService = require('../services/appointmentService');

async function createAppointment(req, res, next) {
  try {
    const appointment = await appointmentService.createAppointment(
      req.user.userId,
      req.body
    );

    return res.status(201).json({
      message: 'Appointment created successfully',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
}

async function getUpcomingAppointments(req, res, next) {
  try {
    const appointments = await appointmentService.getUpcomingAppointments(
      req.user.userId,
      req.params.petId
    );

    return res.status(200).json({
      data: appointments
    });
  } catch (error) {
    next(error);
  }
}


async function getCompletedAppointments(req, res, next) {
  try {
    const appointments = await appointmentService.getCompletedAppointments(
      req.user.userId,
      req.params.petId
    );

    return res.status(200).json({
      data: appointments
    });
  } catch (error) {
    next(error);
  }
}


async function completeAppointment(req, res, next) {
  try {
    const appointment = await appointmentService.completeAppointment(
      req.params.appointmentId
    );

    return res.status(200).json({
      message: 'Appointment completed successfully',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
}


async function getAppointmentsByDate(req, res, next) {
  try {
    const date = req.query.date || new Intl.DateTimeFormat(
      'en-CA',
      {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }
    ).format(new Date());

    const appointments =
      await appointmentService.getAppointmentsByDate(date);

    return res.status(200).json({
      message: 'Appointments retrieved successfully',
      date,
      total: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
}



module.exports = {
  createAppointment,
  getUpcomingAppointments,
  getCompletedAppointments,
    getAppointmentsByDate,
  completeAppointment
};
