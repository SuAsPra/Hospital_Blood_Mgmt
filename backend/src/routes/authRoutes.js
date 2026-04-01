const express = require('express');
const { register, login, me } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

const router = express.Router();

router.post(
  '/register',
  validate({
    required: ['name', 'email', 'password'],
    types: {
      name: 'string',
      email: 'string',
      password: 'string',
      role: 'string',
      department: 'string',
      specialization: 'string',
      adminRegisterKey: 'string',
    },
  }),
  register
);
router.post(
  '/login',
  validate({ required: ['email', 'password'], types: { email: 'string', password: 'string' } }),
  login
);
router.get('/me', protect, me);

module.exports = router;
