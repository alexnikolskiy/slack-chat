const Room = require('../models/room');
const User = require('../models/user');
const Message = require('../models/message');

module.exports = {
  async getAll(req, res) {
    try {
      let rooms = [];

      rooms = await Room.find();
      rooms = rooms.map(room => room.toJSONFor());

      res.status(200).json({ success: true, data: rooms });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
  async getOne(req, res) {
    try {
      const room = await Room.findById(req.params.id);

      if (!room) {
        res.status(404).json({ success: false, error: 'Not found' });
      }

      res.status(200).json({ success: true, data: room.toJSONFor() });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
  async getMembers(req, res) {
    try {
      let members = [];

      members = await User.find({ room: req.params.id }).populate('room');
      members = members.map(member => member.toJSONFor());

      res.status(200).json({ success: true, data: members });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
  async getMessages(req, res) {
    try {
      let messages = [];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      messages = await Message.find({
        room: req.params.id,
        receiver: null,
        timestamp: {
          $gte: yesterday,
        },
      })
        .populate('sender')
        .populate('room')
        .sort('timestamp');

      messages = messages.map(message => message.toJSONFor());

      res.status(200).json({ success: true, data: messages });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
  async getPrivateMessages(req, res) {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      let messages = await Message.find({
        $and: [
          { room: req.params.id },
          { timestamp: { $gte: yesterday } },
          {
            $or: [
              {
                $and: [{ sender: req.session.user }, { receiver: req.params.receiver }],
              },
              {
                $and: [{ sender: req.params.receiver }, { receiver: req.session.user }],
              },
            ],
          },
        ],
      })
        .populate('sender')
        .populate('receiver')
        .populate('room')
        .sort('timestamp');

      messages = messages.map(message => message.toJSONFor());

      res.status(200).json({ success: true, data: messages });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
};
