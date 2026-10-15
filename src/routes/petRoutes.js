const express = require('express');
const petController = require('../controllers/petController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = express.Router();
router.use(authenticate);
router.post('/', authorize('owner'), petController.registerPet);
router.get('/', (req, res, next) => {
  if (req.user.role === 'admin') {
    return petController.getPets(req, res, next);
  }
  return petController.getMyPets(req, res, next);
});
router.put('/:petId', authorize('admin'), petController.editPet);

module.exports = router;
