const express = require('express');

const router = express.Router();
const path = require('path');
const { isNotAuth } = require('../middlewares/auth');
const authController = require('../controllers/auth');

router.get('/login', isNotAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'login.html'));
});

router.post('/login', authController.login);

router.post('/signup', authController.signup);

module.exports = router;
