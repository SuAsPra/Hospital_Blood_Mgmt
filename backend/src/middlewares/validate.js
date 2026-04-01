const isEmpty = (val) => val === undefined || val === null || val === '';

const validate = (schema = {}) => (req, res, next) => {
  const errors = [];
  const { required = [], types = {}, arrayMin = {}, numberMin = {}, oneOf = {} } = schema;

  for (const field of required) {
    if (isEmpty(req.body[field])) {
      errors.push(`${field} is required`);
    }
  }

  for (const [field, type] of Object.entries(types)) {
    const value = req.body[field];
    if (isEmpty(value)) continue;

    if (type === 'string' && typeof value !== 'string') {
      errors.push(`${field} must be a string`);
    }
    if (type === 'number' && (typeof value !== 'number' || Number.isNaN(value))) {
      errors.push(`${field} must be a number`);
    }
    if (type === 'array' && !Array.isArray(value)) {
      errors.push(`${field} must be an array`);
    }
    if (type === 'boolean' && typeof value !== 'boolean') {
      errors.push(`${field} must be a boolean`);
    }
    if (type === 'date' && Number.isNaN(Date.parse(value))) {
      errors.push(`${field} must be a valid date`);
    }
  }

  for (const [field, min] of Object.entries(arrayMin)) {
    const value = req.body[field];
    if (!isEmpty(value) && Array.isArray(value) && value.length < min) {
      errors.push(`${field} must have at least ${min} item(s)`);
    }
  }

  for (const [field, min] of Object.entries(numberMin)) {
    const value = req.body[field];
    if (!isEmpty(value) && typeof value === 'number' && value < min) {
      errors.push(`${field} must be >= ${min}`);
    }
  }

  for (const [field, allowed] of Object.entries(oneOf)) {
    const value = req.body[field];
    if (!isEmpty(value) && Array.isArray(allowed) && !allowed.includes(value)) {
      errors.push(`${field} must be one of: ${allowed.join(', ')}`);
    }
  }

  if (errors.length) {
    return res.status(400).json({ message: 'Validation error', errors });
  }

  return next();
};

module.exports = { validate };
