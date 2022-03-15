const { promisify } = require('util');
const crypto = require('crypto');
const User = require('../model/userModel');
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signedToken = (id) => {
  return jwt.sign({ id }, 'SECRET', {
    expiresIn: '20d',
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signedToken(user._id);
  const cookieOption = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOption.secure = true;
  res.cookie('jwt', token, cookieOption);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'Success',
    data: {
      user,
      token,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if email andpassword exists or not
  if (!email || !password) {
    return next(new appError('please provide email and password', 400));
  }
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new appError('Incorect email or password ', 400));
  }

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) get the token and check of it's therre or not
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('you are not logged in pLease login to get access', 401)
    );
  }

  console.log(token);

  // 2)verification token
  const decoded = await promisify(jwt.verify)(token, 'SECRET');
  //3) check if the user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        'the user belonging to the token does no longer exists ',
        401
      )
    );
  }

  // 4) if user change password after the jwt was issued

  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password PLease login again ')
    );
  }

  req.user = currentUser;

  next();
});

exports.restrict = (...roles) => {
  return (req, res, next) => {
    console.log(req.user.role);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('you have no permission to performthis action .... ')
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user based on posted email /
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address '));
  }
  // generate the radmom reset token /
  const resetToken = user.createPasswordResetToken();
  await user.save({
    validateBeforeSave: false,
  });
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot you password ? submit patch requestwith your new password and password confirm to ${resetUrl}.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Passwword reset token for 10 minutes',
      message,
    });
    res.status(200).json({
      status: 'Success',
      message: 'token send to email ',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;

    await user.save({
      validateBeforeSave: false,
    });
    return next(
      new AppError('There was an error sendingthe email . Try agai n', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on the tokn
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('invalid token or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();

  createSendToken(newUser, 201, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');
  const checkPassword = user.correctPassword(
    req.body.passwordConfirm,
    user.password
  );
  if (!checkPassword) {
    return next(new AppError('Password does not match ', 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // we don't use findByIdAndUpdate because our mongoose middleware then will not validate and doesnot work
  await user.save();
  createSendToken(newUser, 201, res);
});
