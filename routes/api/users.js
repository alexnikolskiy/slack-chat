const express = require('express');

const router = express.Router();
const userController = require('../../controllers/user');

router.post('/:id', userController.save);

module.exports = router;
