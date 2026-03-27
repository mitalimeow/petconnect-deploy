const User = require('../models/User');

module.exports = async function (req, res, next) {
  try {
    // If auth middleware stored tags in token and they include Admin
    if (req.user && req.user.tags && req.user.tags.includes('Admin')) {
      return next();
    }

    // Otherwise strictly verify from DB
    if (req.user && req.user.id) {
      const user = await User.findById(req.user.id);
      if (user && user.tags && user.tags.includes('Admin')) {
        return next();
      }
    }

    return res.status(403).json({ message: 'Forbidden: Admin access only' });
  } catch (err) {
    res.status(500).json({ message: 'Server error checking admin privileges' });
  }
};
