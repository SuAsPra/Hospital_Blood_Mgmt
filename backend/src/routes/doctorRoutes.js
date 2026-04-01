const express = require('express');
const { createDoctor, listDoctors, getDoctor, getMyDoctor, updateDoctor, updateMyDoctor } = require('../controllers/doctorController');
const { protect, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { validateObjectId } = require('../middlewares/validateObjectId');

const router = express.Router();

router.get('/', listDoctors);
router.get('/me', protect, authorize('doctor'), getMyDoctor);
router.put(
  '/me',
  protect,
  authorize('doctor'),
  validate({ types: { department: 'string', specialization: 'string', room: 'string' } }),
  updateMyDoctor
);
router.get('/:id', validateObjectId('id'), getDoctor);
router.post(
  '/',
  protect,
  authorize('admin'),
  validate({ required: ['user', 'department', 'specialization'], types: { user: 'string', department: 'string', specialization: 'string' } }),
  createDoctor
);
router.put(
  '/:id',
  protect,
  authorize('admin'),
  validateObjectId('id'),
  validate({ types: { department: 'string', specialization: 'string', room: 'string' } }),
  updateDoctor
);

module.exports = router;
