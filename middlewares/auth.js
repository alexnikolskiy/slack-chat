function isAuth(req, res, next) {
  if (req.session.isAuth) {
    return next();
  }

  res.redirect('/auth/login');
}

function isNotAuth(req, res, next) {
  if (!req.session.isAuth) {
    return next();
  }

  res.redirect('/');
}

module.exports = {
  isAuth,
  isNotAuth,
};
