const express = require('express');
const { protectApi } = require('../middlewares/auth');

const router = express.Router();

const roomsRouter = require('./api/rooms');
const usersRouter = require('./api/users');

router.use(protectApi);
router.use('/rooms', roomsRouter);
router.use('/users', usersRouter);

module.exports = router;
