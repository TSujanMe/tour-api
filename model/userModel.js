const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { doesNotMatch } = require('assert');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A name is required '],
  },
  email: {
    type: String,
    required: [true, 'Email is required '],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please Provide us a Valid Email address'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Password  is required '],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      // this validator is only works for save only
      validator: function (el) {
        return el === this.password;
      },
      message: 'password are not the same .',
    },
  },
  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// this middleware will only runs if password was actually modeifed
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangeAt) {
    const changedTimeStamp = parseInt(this.passwordChangeAt.getTime() / 1000);
    return JWTTimestamp < changedTimeStamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log(resetToken, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.pre('save', function (next) {
  // this says that when password is not modified and new we will not do any on password changeAt property
  // if password is not new and change then we need to set tthe value of password chanegAt as currnt data
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangeAt = Date.now() - 1000;
  next();
});



userSchema.pre(/^find/, async function (next) {
  // this is the query middleware so ths point to query obj
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
