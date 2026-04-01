const express = require('express');
const { createOrder, listOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { validateObjectId } = require('../middlewares/validateObjectId');

const router = express.Router();
const orderStatuses = ['pending', 'paid', 'not_shipped', 'shipped', 'delivered', 'closed', 'cancelled'];

router.post(
  '/',
  protect,
  authorize('public', 'doctor'),
  validate({ required: ['items'], types: { items: 'array' }, arrayMin: { items: 1 } }),
  createOrder
);
router.get('/', protect, listOrders);
router.put(
  '/:id',
  protect,
  authorize('admin', 'blood_staff', 'receptionist', 'nurse'),
  validateObjectId('id'),
  validate({ types: { status: 'string' }, oneOf: { status: orderStatuses } }),
  updateOrderStatus
);

module.exports = router;
