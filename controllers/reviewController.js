const Review = require('../model/reviewModel');
const User = require('../model/userModel');
const Tour = require('../model/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./HandlerFactory');

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.createReview =factory.getAll(Review)
exports.getReview = factory.getOne(Review)
exports.getAllReviews = factory.getAll(Review)
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
