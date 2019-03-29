const express = require('express');

const router = express.Router();
const path = require('path');
const { isAuth } = require('../middlewares/auth');

router.get('/', isAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

module.exports = router;
