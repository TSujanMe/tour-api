const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review must not be empty'],
    },
    ratings: {
      type: Number,
      min: 1,
      max: 5,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Review must belong to a User'],
      ref: 'User',
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Review must belong to a tour'],
      ref: 'Tour',
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});




const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
