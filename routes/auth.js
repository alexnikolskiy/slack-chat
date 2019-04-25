const express = require('express');

const router = express.Router();
const path = require('path');
const multer = require('multer');
const { body } = require('express-validator/check');
const { isNotAuth } = require('../middlewares/auth');
const authController = require('../controllers/auth');
const User = require('../models/user');

const upload = multer();

router.get('/login', isNotAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'login.html'));
});

const checkUsername = () =>
  body('username')
    .not()
    .isEmpty()
    .withMessage('empty username')
    .isLength({ min: 3, max: 20 })
    .withMessage('username must be 6+ and 20- chars long');

const checkPassword = () =>
  body('password')
    .not()
    .isEmpty()
    .withMessage('empty password')
    .isLength({ min: 6 })
    .withMessage('password must be 6+ chars long');

router.post(
  '/login',
  upload.none(),
  [
    checkUsername().custom(async value => {
      const user = await User.findOne({ username: value });

      if (!user) {
        throw new Error('user not exist');
      }
    }),
    checkPassword().custom(async (value, { req }) => {
      const user = await User.findOne({ username: req.body.username });

      if (user && !(await user.validatePassword(value))) {
        throw new Error('incorrect password');
      }
    }),
  ],
  authController.login,
);

router.post(
  '/signup',
  upload.none(),
  [
    checkUsername().custom(async value => {
      const user = await User.findOne({ username: value });

      if (user) {
        throw new Error('user already exist');
      }
    }),
    checkPassword()
      .custom((value, { req }) => value === req.body.confirmPassword)
      .withMessage('passwords are noq equal'),
  ],
  authController.signup,
);

router.post('/logout', authController.logout);

module.exports = router;
