const User = require('../models/user');

function validate(data = {}) {
  const error = {};

  if (!data.username || !data.password) {
    if (!data.username) {
      error.username = 'Empty username';
    }
    if (!data.password) {
      error.password = 'Empty password';
    }
  } else {
    if (data.username.length < 3 || data.username.length > 20) {
      error.username = 'username must be >= 3 and <= 20 chars';
    }
    if (data.password.length < 6) {
      error.password = 'password must be >= 6 chars';
    }
  }

  return error;
}

module.exports = {
  async login(req, res, next) {
    const error = validate(req.body);
    const isError = !!Object.keys(error).length;

    if (isError) {
      res.status(403).json({ success: false, error });
    } else {
      try {
        const user = await User.findOne({ username: req.body.username });

        if (!user) {
          error.username = 'user not exist';
          res.status(403).json({ success: false, error });
        } else if (!(await user.validatePassword(req.body.password))) {
          error.password = 'incorrect password';
          res.status(403).json({ success: false, error });
        } else {
          req.session.isAuth = true;
          req.session.user = user._id;
          res.status(200).json({ success: true });
        }
      } catch (err) {
        next(err);
      }
    }
  },
  async signup(req, res, next) {
    const error = validate(req.body);
    const isError = !!Object.keys(error).length;

    if (isError) {
      res.status(403).json({ success: false, error });
    } else if (!req.body.confirmPassword || req.body.password !== req.body.confirmPassword) {
      error.confirmPassword = 'Passwords are noq equal';
      res.status(403).json({ success: false, error });
    } else {
      const user = await User.findOne({ username: req.body.username });
      if (user) {
        error.username = 'User already exist';
        res.status(403).json({ success: false, error });
      } else {
        try {
          const newUser = new User();
          newUser.username = req.body.username;
          newUser.password = await newUser.generateHash(req.body.password);
          await newUser.save();
          req.session.isAuth = true;
          // req.session.username = req.body.username;
          req.session.user = newUser._id;
          res.status(200).json({ success: true });
        } catch (err) {
          next(err);
        }
      }
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
  },
};
