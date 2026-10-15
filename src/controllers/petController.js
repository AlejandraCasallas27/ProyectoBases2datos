
const petService = require('../services/petService');

async function registerPet(req, res, next) {
  try {
    const pet = await petService.registerPet(req.user.userId, req.body);

    return res.status(201).json({
      message: 'Pet registered successfully',
      data: pet
    });
  } catch (error) {
    return next(error);
  }
}

async function getMyPets(req, res, next) {
  try {
    const pets = await petService.getMyPets(req.user.userId);

    return res.status(200).json({
      data: pets
    });
  } catch (error) {
    return next(error);
  }
}

async function getPets(req, res, next) {
  try {
    const pets = await petService.getPets(
      req.query.search
    );

    return res.status(200).json({
      message: 'Pets retrieved successfully',
      total: pets.length,
      data: pets
    });
  } catch (error) {
    next(error);
  }
}

async function editPet(req, res, next) {
  try {
    const pet = await petService.editPet(
      req.params.petId,
      req.body
    );

    return res.status(200).json({
      message: 'Pet updated successfully',
      data: pet
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerPet,
  getMyPets,
  getPets,
  editPet
};
