const User = require('../models/user');

module.exports = async (req, res, next) => {
  if (!req.session.user) return next();

  try {
    req.user = await User.findById(req.session.user);
    next();
  } catch (err) {
    return next(err);
  }
};
