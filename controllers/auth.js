const { validationResult } = require('express-validator/check');
const User = require('../models/user');

module.exports = {
  async login(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({ success: false, errors: errors.array() });
    }

    const user = await User.findOne({ username: req.body.username });

    req.session.isAuth = true;
    req.session.user = user._id;
    res.status(200).json({ success: true });
  },
  async signup(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({ success: false, errors: errors.array() });
    }

    try {
      const newUser = new User();
      newUser.username = req.body.username;
      newUser.password = await newUser.generateHash(req.body.password);
      await newUser.save();
      req.session.isAuth = true;
      req.session.user = newUser._id;
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  },
  logout(req, res, next) {
    if (req.session) {
      const io = req.app.get('io');
      const { socket } = req.user;

      req.session.destroy(err => {
        io.to(socket).emit('logout');

        if (err) {
          return next(err);
        }

        return res.status(200).json({ success: true });
      });
    }

    return res.status(403).json({ success: false });
  },
};
