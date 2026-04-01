const express = require('express');
const {
  createPatient,
  listPatients,
  getMyPatient,
  getPatient,
  updatePatient,
  admitPatient,
  dischargePatient,
} = require('../controllers/patientController');
const { protect, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { validateObjectId } = require('../middlewares/validateObjectId');

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('admin', 'receptionist', 'nurse', 'public'),
  validate({
    types: { dateOfBirth: 'date', gender: 'string', bloodGroup: 'string', address: 'string' },
  }),
  createPatient
);
router.get('/me', protect, authorize('public'), getMyPatient);
router.get('/', protect, authorize('admin', 'receptionist', 'nurse', 'doctor'), listPatients);
router.get('/:id', protect, validateObjectId('id'), getPatient);
router.put(
  '/:id',
  protect,
  authorize('admin', 'receptionist', 'nurse'),
  validateObjectId('id'),
  validate({
    types: { dateOfBirth: 'date', gender: 'string', bloodGroup: 'string', address: 'string' },
  }),
  updatePatient
);
router.patch('/:id/admit', protect, authorize('admin', 'receptionist', 'nurse'), validateObjectId('id'), admitPatient);
router.patch('/:id/discharge', protect, authorize('admin', 'receptionist', 'nurse'), validateObjectId('id'), dischargePatient);

module.exports = router;
