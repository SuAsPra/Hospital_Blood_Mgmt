const express = require('express');
const { listMedicines, createMedicine, updateMedicine } = require('../controllers/medicineController');
const { protect, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { validateObjectId } = require('../middlewares/validateObjectId');

const router = express.Router();

router.get('/', listMedicines);
router.post(
  '/',
  protect,
  authorize('admin', 'blood_staff', 'nurse'),
  validate({
    required: ['name', 'price', 'stockQty'],
    types: {
      name: 'string',
      price: 'number',
      stockQty: 'number',
      brand: 'string',
      category: 'string',
      form: 'string',
      strength: 'string',
      batchNo: 'string',
      imageUrl: 'string',
      expiryDate: 'date',
      availability: 'boolean',
      stockOver: 'boolean',
      prescriptionRequired: 'boolean',
    },
    numberMin: { price: 0, stockQty: 0 },
  }),
  createMedicine
);
router.put(
  '/:id',
  protect,
  authorize('admin', 'blood_staff', 'nurse'),
  validateObjectId('id'),
  validate({
    types: {
      name: 'string',
      price: 'number',
      stockQty: 'number',
      category: 'string',
      brand: 'string',
      form: 'string',
      strength: 'string',
      batchNo: 'string',
      imageUrl: 'string',
      expiryDate: 'date',
      availability: 'boolean',
      stockOver: 'boolean',
      prescriptionRequired: 'boolean',
    },
    numberMin: { price: 0, stockQty: 0 },
  }),
  updateMedicine
);

module.exports = router;
