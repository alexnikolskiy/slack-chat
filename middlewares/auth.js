function isAuth(req, res, next) {
  if (req.session.isAuth) {
    return next();
  }

  return res.redirect('/auth/login');
}

function isNotAuth(req, res, next) {
  if (!req.session.isAuth) {
    return next();
  }

  return res.redirect('/');
}

function protectApi(req, res, next) {
  if (req.session.isAuth) {
    return next();
  }

  return res.status(403).json({ success: false, error: 'Forbidden' });
}

module.exports = {
  isAuth,
  isNotAuth,
  protectApi,
};
