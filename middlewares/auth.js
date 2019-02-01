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

module.exports = {
  isAuth,
  isNotAuth,
};
