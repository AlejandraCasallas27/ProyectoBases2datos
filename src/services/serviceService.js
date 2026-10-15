
const serviceRepository = require('../repositories/serviceRepository');

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function validateService(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw createError('Service data is required', 400);
  }

  const { name, description, veterinarianName, durationMinutes, price } = data;

  if (
    typeof name !== 'string' ||
    typeof description !== 'string' ||
    typeof veterinarianName !== 'string'
  ) {
    throw createError('Name, description and veterinarian name are required', 400);
  }

  const normalizedName = name.trim();
  const normalizedDescription = description.trim();
  const normalizedVeterinarian = veterinarianName.trim();

  if (!normalizedName || !normalizedDescription || !normalizedVeterinarian) {
    throw createError('Service fields cannot be empty', 400);
  }

  if (
    normalizedName.length > 120 ||
    normalizedVeterinarian.length > 120
  ) {
    throw createError('Service name or veterinarian name is too long', 400);
  }

  if (
    !Number.isInteger(durationMinutes) ||
    durationMinutes < 1 ||
    durationMinutes > 65535
  ) {
    throw createError('Duration must be a positive integer', 400);
  }

  if (
    typeof price !== 'number' ||
    !Number.isFinite(price) ||
    price < 0 ||
    price > 99999999.99 ||
    !Number.isInteger(Math.round(price * 10000) / 100)
  ) {
    throw createError('Price must be a valid non-negative amount with at most two decimal places', 400);
  }

  return {
    name: normalizedName,
    description: normalizedDescription,
    veterinarianName: normalizedVeterinarian,
    durationMinutes,
    price
  };
}

function validateId(serviceId) {
  const id = Number(serviceId);

  if (!Number.isSafeInteger(id) || id <= 0 || id > 4294967295) {
    throw createError('Invalid service ID', 400);
  }

  return id;
}

async function getActiveServices() {
  return serviceRepository.findAllActive();
}

async function getAllServices() {
  return serviceRepository.findAll();
}

async function getServiceById(serviceId) {
  const id = validateId(serviceId);
  const service = await serviceRepository.findById(id);

  if (!service) {
    throw createError('Service not found', 404);
  }

  return service;
}

async function createService(data) {
  const validatedData = validateService(data);
  const serviceId = await serviceRepository.createService(validatedData);

  return getServiceById(serviceId);
}

async function updateService(serviceId, data) {
  const id = validateId(serviceId);
  await getServiceById(id);

  const validatedData = validateService(data);
  await serviceRepository.updateService(id, validatedData);

  return getServiceById(id);
}

async function deactivateService(serviceId) {
  const id = validateId(serviceId);
  const service = await getServiceById(id);

  if (!service.isActive) {
    throw createError('Service is already inactive', 409);
  }

  await serviceRepository.deactivateService(id);

  return getServiceById(id);
}

module.exports = {
  getActiveServices,
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deactivateService
};
