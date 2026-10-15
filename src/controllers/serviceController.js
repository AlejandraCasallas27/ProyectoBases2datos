
const serviceService = require('../services/serviceService');

async function getActiveServices(req, res, next) {
  try {
    const services = await serviceService.getActiveServices();
    return res.status(200).json({ data: services });
  } catch (error) {
    return next(error);
  }
}

async function getAllServices(req, res, next) {
  try {
    const services = await serviceService.getAllServices();
    return res.status(200).json({ data: services });
  } catch (error) {
    return next(error);
  }
}

async function getServiceById(req, res, next) {
  try {
    const service = await serviceService.getServiceById(req.params.serviceId);
    return res.status(200).json({ data: service });
  } catch (error) {
    return next(error);
  }
}

async function createService(req, res, next) {
  try {
    const service = await serviceService.createService(req.body);

    return res.status(201).json({
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    return next(error);
  }
}

async function updateService(req, res, next) {
  try {
    const service = await serviceService.updateService(
      req.params.serviceId,
      req.body
    );

    return res.status(200).json({
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    return next(error);
  }
}

async function deactivateService(req, res, next) {
  try {
    const service = await serviceService.deactivateService(
      req.params.serviceId
    );

    return res.status(200).json({
      message: 'Service deactivated successfully',
      data: service
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getActiveServices,
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deactivateService
};
