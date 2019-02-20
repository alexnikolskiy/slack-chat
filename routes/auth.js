const express = require('express');

const router = express.Router();
const path = require('path');
const multer = require('multer');
const { isNotAuth } = require('../middlewares/auth');
const authController = require('../controllers/auth');

const upload = multer();

router.get('/login', isNotAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'login.html'));
});

router.post('/login', upload.none(), authController.login);

router.post('/logout', authController.logout);

router.post('/signup', upload.none(), authController.signup);

module.exports = router;
