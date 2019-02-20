const express = require('express');

const router = express.Router();

const roomsRouter = require('./api/rooms');
const usersRouter = require('./api/users');

router.use('/rooms', roomsRouter);
router.use('/users', usersRouter);

module.exports = router;
