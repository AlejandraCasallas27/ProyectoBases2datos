
const reviewService = require('../services/reviewService');

async function createReview(req, res, next) {
  try {
    const ownerId = req.user.userId;

    const review = await reviewService.createReview(
      ownerId,
      req.body
    );

    return res.status(201).json({
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createReview
};
