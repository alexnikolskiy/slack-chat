const express = require('express');

const router = express.Router();
const roomController = require('../../controllers/room');

router.get('/', roomController.getAll);
router.get('/:id', roomController.getOne);
router.get('/:id/members', roomController.getMembers);
router.get('/:id/messages', roomController.getMessages);
router.get('/:id/messages/:receiver', roomController.getPrivateMessages);

module.exports = router;
