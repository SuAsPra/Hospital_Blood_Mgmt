const errorHandler = (err, req, res, next) => {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const message = err.message || 'Server error';
  res.status(status).json({ message });
};

module.exports = { errorHandler };
