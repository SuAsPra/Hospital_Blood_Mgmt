const { Medicine } = require('../models');

const listMedicines = async (req, res) => {
  const medicines = await Medicine.find({ isActive: true });
  return res.json({ medicines });
};

const createMedicine = async (req, res) => {
  const stockQty = Number(req.body.stockQty ?? 0);
  const stockOver = typeof req.body.stockOver === 'boolean' ? req.body.stockOver : stockQty <= 0;
  const availability =
    typeof req.body.availability === 'boolean' ? req.body.availability : !stockOver;

  const medicine = await Medicine.create({
    ...req.body,
    stockQty,
    stockOver,
    availability: stockOver ? false : availability,
  });
  return res.status(201).json({ medicine });
};

const updateMedicine = async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);
  if (!medicine) {
    return res.status(404).json({ message: 'Medicine not found' });
  }

  Object.assign(medicine, req.body);
  if (typeof req.body.stockQty === 'number') {
    medicine.stockQty = req.body.stockQty;
  }

  if (typeof req.body.stockOver === 'boolean') {
    medicine.stockOver = req.body.stockOver;
    if (req.body.stockOver) {
      medicine.availability = false;
    }
  } else if (typeof medicine.stockQty === 'number') {
    medicine.stockOver = medicine.stockQty <= 0;
    if (medicine.stockOver) {
      medicine.availability = false;
    }
  }

  if (!medicine.stockOver && typeof req.body.availability === 'boolean') {
    medicine.availability = req.body.availability;
  }

  await medicine.save();
  return res.json({ medicine });
};

module.exports = { listMedicines, createMedicine, updateMedicine };
