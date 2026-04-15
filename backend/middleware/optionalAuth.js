const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.cookies?.petconnect_auth || req.header('Authorization')?.split(' ')[1];
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    next();
  }
};
