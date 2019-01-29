const User = require('../models/user');

module.exports = {
  async getAll(req, res) {
    try {
      let users = [];

      users = await User.find();
      users = rooms.map(user => ({
        id: user._id,
        username: user.name,
        online: user.online,
        chat: user.chat._id,
      }));

      res.status(200).json({ success: true, data: users });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
  async getOne(req, res) {
    try {
      const data = await User.findById(req.params.id);

      if (!data) {
        res.status(404).json({ success: false, error: 'Not found' });
      }

      const user = {
        id: data._id,
        username: data.name,
        online: data.online,
        chat: data.chat._id,
      };

      res.status(200).json({ success: true, data: user });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
};
