const express = require('express');
const {
  loginAdmin,
  getAllDoctorsForAdmin,
  getDoctorDetailsForAdmin,
  getAllPatientsForAdmin,
  updatePatientMedicalHistoryForAdmin,
  getAllAppointmentsForAdmin,
  updateAppointmentForAdmin,
  getBloodStatusForAdmin,
  reduceBloodSupplyForAdmin,
  closeBloodSupplyForAdmin,
  getAllOrdersForAdmin,
  updateOrderStatusForAdmin,
} = require('../controllers/adminController');
const { protectAdmin } = require('../middlewares/adminAuth');
const { validate } = require('../middlewares/validate');
const { validateObjectId } = require('../middlewares/validateObjectId');

const router = express.Router();
const appointmentStatuses = ['pending', 'approved', 'rescheduled', 'cancelled', 'completed'];
const orderStatuses = ['pending', 'paid', 'not_shipped', 'shipped', 'delivered', 'closed', 'cancelled'];

router.post(
  '/login',
  validate({
    required: ['email', 'password'],
    types: { email: 'string', password: 'string' },
  }),
  loginAdmin
);

router.get('/doctors', protectAdmin, getAllDoctorsForAdmin);
router.get('/doctors/:id', protectAdmin, validateObjectId('id'), getDoctorDetailsForAdmin);
router.get('/patients', protectAdmin, getAllPatientsForAdmin);
router.put(
  '/patients/:id/medical-history',
  protectAdmin,
  validateObjectId('id'),
  validate({ types: { allergies: 'array', conditions: 'array' } }),
  updatePatientMedicalHistoryForAdmin
);
router.get('/appointments', protectAdmin, getAllAppointmentsForAdmin);
router.put(
  '/appointments/:id',
  protectAdmin,
  validateObjectId('id'),
  validate({
    types: { appointmentDate: 'date', timeSlot: 'string', status: 'string', notes: 'string' },
    oneOf: { status: appointmentStatuses },
  }),
  updateAppointmentForAdmin
);
router.get('/blood', protectAdmin, getBloodStatusForAdmin);
router.patch(
  '/blood/:id/reduce',
  protectAdmin,
  validateObjectId('id'),
  validate({ required: ['units'], types: { units: 'number' }, numberMin: { units: 1 } }),
  reduceBloodSupplyForAdmin
);
router.patch(
  '/blood/:id/close',
  protectAdmin,
  validateObjectId('id'),
  validate({ required: ['isClosed'], types: { isClosed: 'boolean' } }),
  closeBloodSupplyForAdmin
);
router.get('/orders', protectAdmin, getAllOrdersForAdmin);
router.put(
  '/orders/:id',
  protectAdmin,
  validateObjectId('id'),
  validate({ required: ['status'], types: { status: 'string' }, oneOf: { status: orderStatuses } }),
  updateOrderStatusForAdmin
);

module.exports = router;
