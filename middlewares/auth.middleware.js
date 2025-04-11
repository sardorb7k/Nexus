const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  } else {
    return res.redirect("/auth/signin");
  }
};

const isNotAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    return next();
  } else {
    return res.redirect("/log");
  }
};

module.exports = {
  isAuthenticated,
  isNotAuthenticated,
};
