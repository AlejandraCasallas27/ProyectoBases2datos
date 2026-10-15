
const express = require('express');
const serviceController = require('../controllers/serviceController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = express.Router();

router.get('/', serviceController.getActiveServices);

router.get(
  '/admin',
  authenticate,
  authorize('admin'),
  serviceController.getAllServices
);

router.get('/:serviceId', serviceController.getServiceById);

router.post(
  '/',
  authenticate,
  authorize('admin'),
  serviceController.createService
);

router.put(
  '/:serviceId',
  authenticate,
  authorize('admin'),
  serviceController.updateService
);

router.patch(
  '/:serviceId/deactivation',
  authenticate,
  authorize('admin'),
  serviceController.deactivateService
);

module.exports = router;
