
const reviewRepository = require('../repositories/reviewRepository');

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function validateId(value, fieldName) {
  if (
    !Number.isSafeInteger(value) ||
    value <= 0 ||
    value > 4294967295
  ) {
    throw createError(`Invalid ${fieldName}`, 400);
  }

  return value;
}

function validateReview(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw createError('Review data is required', 400);
  }

  const appointmentId = validateId(
    data.appointmentId,
    'appointment ID'
  );

  if (
    !Number.isInteger(data.rating) ||
    data.rating < 1 ||
    data.rating > 5
  ) {
    throw createError(
      'Rating must be an integer between 1 and 5',
      400
    );
  }

  let comment = null;

  if (data.comment !== undefined && data.comment !== null) {
    if (typeof data.comment !== 'string') {
      throw createError('Comment must be a string', 400);
    }

    comment = data.comment.trim() || null;

    if (comment && comment.length > 5000) {
      throw createError(
        'Comment cannot exceed 5000 characters',
        400
      );
    }
  }

  let petComfortLevel = null;

  if (
    data.petComfortLevel !== undefined &&
    data.petComfortLevel !== null
  ) {
    if (
      !Number.isInteger(data.petComfortLevel) ||
      data.petComfortLevel < 1 ||
      data.petComfortLevel > 5
    ) {
      throw createError(
        'Pet comfort level must be an integer between 1 and 5',
        400
      );
    }

    petComfortLevel = data.petComfortLevel;
  }

  const tagIds = data.tagIds === undefined ? [] : data.tagIds;

  if (!Array.isArray(tagIds)) {
    throw createError('Tag IDs must be an array', 400);
  }

  if (tagIds.length > 20) {
    throw createError(
      'A review cannot contain more than 20 tags',
      400
    );
  }

  for (const tagId of tagIds) {
    validateId(tagId, 'tag ID');
  }

  if (new Set(tagIds).size !== tagIds.length) {
    throw createError('Duplicate tags are not allowed', 400);
  }

  return {
    appointmentId,
    rating: data.rating,
    comment,
    petComfortLevel,
    tagIds
  };
}

async function createReview(ownerId, data) {
  const validatedData = validateReview(data);
  
if (validatedData.tagIds.length > 0) {
  const availableTags = await reviewRepository.findTagsByIds(
    validatedData.tagIds
  );

  if (availableTags.length !== validatedData.tagIds.length) {
    throw createError(
      'One or more review tags do not exist',
      400
    );
  }
}



  const reviewId = await reviewRepository.createReview({
    ...validatedData,
    ownerId
  });

  const review = await reviewRepository.findById(reviewId);
  const tags = await reviewRepository.findTagsByReviewId(reviewId);

  return {
    ...review,
    tags
  };
}

module.exports = {
  createReview
};
