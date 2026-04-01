const jwt = require('jsonwebtoken');
const { User, Admin } = require('../models');

const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const principal =
      decoded.role === 'admin'
        ? await Admin.findById(decoded.id).select('-password')
        : await User.findById(decoded.id).select('-password');
    if (!principal || !principal.isActive) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    req.user = principal;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  return next();
};

module.exports = { protect, authorize };
