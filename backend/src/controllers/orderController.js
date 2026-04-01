const { Order, Medicine } = require('../models');

const createOrder = async (req, res) => {
  const { items, deliveryAddress } = req.body;
  if (!items || !items.length) {
    return res.status(400).json({ message: 'Order items are required' });
  }

  let subtotal = 0;
  const enrichedItems = [];

  for (const item of items) {
    const medicine = await Medicine.findById(item.medicine);
    if (!medicine || !medicine.isActive) {
      return res.status(400).json({ message: 'Invalid medicine in order' });
    }

    const qty = Number(item.qty || 0);
    if (qty <= 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    if (medicine.stockQty < qty) {
      return res.status(400).json({ message: `Insufficient stock for ${medicine.name}` });
    }

    subtotal += medicine.price * qty;
    enrichedItems.push({
      medicine: medicine._id,
      name: medicine.name,
      qty,
      price: medicine.price,
    });
  }

  const order = await Order.create({
    user: req.user._id,
    items: enrichedItems,
    subtotal,
    total: subtotal,
    deliveryAddress,
  });

  for (const item of enrichedItems) {
    const med = await Medicine.findById(item.medicine);
    if (!med) continue;
    med.stockQty = Math.max(0, med.stockQty - item.qty);
    if (med.stockQty <= 0) {
      med.stockOver = true;
      med.availability = false;
    }
    await med.save();
  }

  return res.status(201).json({ order });
};

const listOrders = async (req, res) => {
  const filter =
    req.user.role === 'public' || req.user.role === 'doctor'
      ? { user: req.user._id }
      : {};
  const orders = await Order.find(filter).populate('user', 'name email');
  return res.json({ orders });
};

const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  Object.assign(order, req.body);
  await order.save();
  return res.json({ order });
};

module.exports = { createOrder, listOrders, updateOrderStatus };
