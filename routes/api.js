const express = require('express');
const router = express.Router();
const { isAuth } = require('../middlewares/auth');
const roomsRouter = require('./api/rooms');

router.use(isAuth);

router.use('/rooms', roomsRouter);

module.exports = router;
