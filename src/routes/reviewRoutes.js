
const express = require('express');
const reviewController = require('../controllers/reviewController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = express.Router();

router.post(
  '/',
  authenticate,
  authorize('owner'),
  reviewController.createReview
);

module.exports = router;
