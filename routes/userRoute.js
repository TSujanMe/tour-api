const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createUser,
  deleteUser,
  getUser,
  updateUser,
  updateMe,
  deleteMe,
  getMe,
} = require('../controllers/userController');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require('../controllers/authController');
const { protect, restrict } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// protect all routesafter this middleware
router.use(protect);

router.patch('/updatePassword', updatePassword);

router.patch('/updateMe', updateMe);
router.patch('/deleteMe', deleteMe);

router.get('/me', getMe, getUser);


// protect all route safter this middleware and accessonly by admin 
router.use(restrict('admin'));
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
module.exports = router;
