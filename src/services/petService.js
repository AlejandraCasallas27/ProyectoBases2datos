
const petRepository = require('../repositories/petRepository');

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

function validateSearch(search) {
  if (search === undefined) {
    return '';
  }

  if (
    typeof search !== 'string' ||
    search.length > 150
  ) {
    throw createError('Invalid search parameter', 400);
  }

  return search.trim();
}

function validateText(value, fieldName, maxLength) {
  if (
    typeof value !== 'string' ||
    !value.trim() ||
    value.trim().length > maxLength
  ) {
    throw createError(`Invalid ${fieldName}`, 400);
  }

  return value.trim();
}

function validateBirthDate(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    throw createError('Invalid birth date', 400);
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw createError('Invalid birth date', 400);
  }

  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());

  if (value > today) {
    throw createError('Birth date cannot be in the future', 400);
  }

  return value;
}


async function registerPet(ownerId, data) {
  const { name, species, breed, birthDate } = data || {};

  if (
    typeof name !== 'string' ||
    typeof species !== 'string' ||
    !name.trim() ||
    !species.trim()
  ) {
    const error = new Error('Pet name and species are required');
    error.statusCode = 400;
    throw error;
  }

  const normalizedName = name.trim();
  const normalizedSpecies = species.trim();

  if (normalizedName.length > 100 || normalizedSpecies.length > 60) {
    const error = new Error('Pet name or species exceeds the allowed length');
    error.statusCode = 400;
    throw error;
  }

  if (breed != null && (typeof breed !== 'string' || breed.trim().length > 100)) {
    const error = new Error('Invalid breed');
    error.statusCode = 400;
    throw error;
  }

  let normalizedBirthDate = null;

  if (birthDate != null) {
    if (
      typeof birthDate !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)
    ) {
      const error = new Error('Birth date must use YYYY-MM-DD format');
      error.statusCode = 400;
      throw error;
    }

    const parsedDate = new Date(`${birthDate}T00:00:00Z`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== birthDate ||
      birthDate > new Date().toISOString().slice(0, 10)
    ) {
      const error = new Error('Invalid birth date');
      error.statusCode = 400;
      throw error;
    }

    normalizedBirthDate = birthDate;
  }

  const pet = {
    name: normalizedName,
    species: normalizedSpecies,
    breed: breed == null ? null : breed.trim() || null,
    birthDate: normalizedBirthDate
  };

  const petId = await petRepository.createPet(ownerId, pet);

  return {
    petId,
    ownerId,
    ...pet
  };
}

async function getMyPets(ownerId) {
  return petRepository.findPetsByOwner(ownerId);
}

async function getPets(search) {
  return petRepository.findPets(validateSearch(search));
}

async function editPet(petIdValue, data) {
  const petId = validateId(petIdValue, 'pet ID');

  if (
    !data ||
    typeof data !== 'object' ||
    Array.isArray(data)
  ) {
    throw createError('Pet data is required', 400);
  }

  const existingPet = await petRepository.findPetById(petId);

  if (!existingPet) {
    throw createError('Pet not found', 404);
  }

  const petName = validateText(data.petName, 'petName', 100);
  const species = validateText(data.species, 'species', 60);

  let breed = null;

  if (data.breed !== undefined && data.breed !== null) {
    if (
      typeof data.breed !== 'string' ||
      data.breed.trim().length > 100
    ) {
      throw createError('Invalid breed', 400);
    }

    breed = data.breed.trim() || null;
  }

  const birthDate = validateBirthDate(data.birthDate);

  await petRepository.updatePet(petId, {
    petName,
    species,
    breed,
    birthDate
  });

  return petRepository.findPetById(petId);
}

module.exports = {
  registerPet,
  getMyPets,
  getPets,
  editPet
};
