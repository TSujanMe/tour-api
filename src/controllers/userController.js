const Tour = require("../model/tourModel");
const User = require("../model/userModel");
const AppError = require("../utils/appError");
const appError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./HandlerFactory");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// this route will neveer open pleaseuse sign up route
exports.createUser = (req, res) => {
  res.status(200).json({
    status: "fail",
    message: "This route isnot implemented ",
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //
  if (req.body.password || req.body.confirmPassword) {
    return next(new AppError("this route isnot for password update ! please api/v1/users/updatePassword", 400));
  }
  // filtered out unwanted object that are not allowed
  const filteredBody = filterObj(req.body, "name", "email");

  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "success",
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
// DONT UPDATE PASSWORD WITH THIS THIS IS ONLY FOR ADMIN
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
