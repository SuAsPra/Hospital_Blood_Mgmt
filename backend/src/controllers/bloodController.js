const { BloodStock, BloodRequest } = require('../models');

const listBloodStock = async (req, res) => {
  const stock = await BloodStock.find();
  return res.json({ stock });
};

const upsertBloodGroup = async (req, res) => {
  const { bloodGroup, totalUnits, reservedUnits, batches } = req.body;
  if (!bloodGroup) {
    return res.status(400).json({ message: 'bloodGroup is required' });
  }

  const stock = await BloodStock.findOneAndUpdate(
    { bloodGroup },
    { totalUnits, reservedUnits, batches, lastUpdated: new Date() },
    { new: true, upsert: true }
  );

  return res.json({ stock });
};

const addDonationBatch = async (req, res) => {
  const { bloodGroup, quantity, expiryDate } = req.body;
  if (!bloodGroup || !quantity || !expiryDate) {
    return res.status(400).json({ message: 'bloodGroup, quantity, expiryDate are required' });
  }

  const stock = await BloodStock.findOne({ bloodGroup });
  if (!stock) {
    return res.status(404).json({ message: 'Blood group not found' });
  }

  stock.batches.push({ quantity, expiryDate });
  stock.totalUnits += Number(quantity);
  stock.lastUpdated = new Date();
  await stock.save();

  return res.json({ stock });
};

const createBloodRequest = async (req, res) => {
  const { type, bloodGroup, units, urgency, notes } = req.body;
  if (!type || !bloodGroup || !units) {
    return res.status(400).json({ message: 'type, bloodGroup, units are required' });
  }

  const request = await BloodRequest.create({
    user: req.user._id,
    type,
    bloodGroup,
    units,
    urgency,
    notes,
  });

  return res.status(201).json({ request });
};

const listMyBloodRequests = async (req, res) => {
  const requests = await BloodRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res.json({ requests });
};

const listBloodRequests = async (req, res) => {
  const requests = await BloodRequest.find().populate('user', 'name email role').sort({ createdAt: -1 });
  return res.json({ requests });
};

module.exports = {
  listBloodStock,
  upsertBloodGroup,
  addDonationBatch,
  createBloodRequest,
  listMyBloodRequests,
  listBloodRequests,
};
