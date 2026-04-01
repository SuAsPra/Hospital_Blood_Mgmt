const express = require('express');
const {
  createAppointment,
  listAppointments,
  getAppointment,
  updateAppointment,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { validateObjectId } = require('../middlewares/validateObjectId');

const router = express.Router();
const appointmentStatuses = ['pending', 'approved', 'rescheduled', 'cancelled', 'completed'];

router.post(
  '/',
  protect,
  authorize('public', 'receptionist'),
  validate({
    required: ['doctor', 'department', 'appointmentDate', 'timeSlot'],
    types: { doctor: 'string', department: 'string', appointmentDate: 'date', timeSlot: 'string' },
  }),
  createAppointment
);
router.get('/', protect, listAppointments);
router.get('/:id', protect, validateObjectId('id'), getAppointment);
router.put(
  '/:id',
  protect,
  authorize('admin', 'doctor', 'nurse', 'receptionist'),
  validateObjectId('id'),
  validate({
    types: { appointmentDate: 'date', timeSlot: 'string', status: 'string', notes: 'string' },
    oneOf: { status: appointmentStatuses },
  }),
  updateAppointment
);

module.exports = router;
