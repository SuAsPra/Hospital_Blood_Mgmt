const express = require('express');
const {
  listBloodStock,
  upsertBloodGroup,
  addDonationBatch,
  createBloodRequest,
  listMyBloodRequests,
  listBloodRequests,
} = require('../controllers/bloodController');
const { protect, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

const router = express.Router();

router.get('/', listBloodStock);

router.post(
  '/',
  protect,
  authorize('admin', 'blood_staff'),
  validate({
    required: ['bloodGroup'],
    types: { bloodGroup: 'string', totalUnits: 'number', reservedUnits: 'number', batches: 'array' },
    numberMin: { totalUnits: 0, reservedUnits: 0 },
  }),
  upsertBloodGroup
);

router.post(
  '/donation',
  protect,
  authorize('admin', 'blood_staff'),
  validate({
    required: ['bloodGroup', 'quantity', 'expiryDate'],
    types: { bloodGroup: 'string', quantity: 'number', expiryDate: 'date' },
    numberMin: { quantity: 1 },
  }),
  addDonationBatch
);

router.post(
  '/requests',
  protect,
  authorize('public', 'doctor'),
  validate({
    required: ['type', 'bloodGroup', 'units'],
    types: { type: 'string', bloodGroup: 'string', units: 'number', urgency: 'string', notes: 'string' },
    numberMin: { units: 1 },
  }),
  createBloodRequest
);

router.get('/requests/me', protect, authorize('public', 'doctor'), listMyBloodRequests);
router.get('/requests', protect, authorize('admin', 'blood_staff'), listBloodRequests);

module.exports = router;
