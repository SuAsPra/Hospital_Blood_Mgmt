const mongoose = require('mongoose');

const validateObjectId = (param = 'id') => (req, res, next) => {
  const value = req.params[param];
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  return next();
};

module.exports = { validateObjectId };
