const jwt = require('jsonwebtoken');
const { Admin, User } = require('../models');

const protectAdmin = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    let admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      admin = await User.findById(decoded.id).select('-password');
    }
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    req.admin = admin;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { protectAdmin };
