const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    category: { type: String, trim: true },
    form: { type: String, trim: true },
    strength: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    stockQty: { type: Number, required: true, min: 0 },
    expiryDate: { type: Date },
    batchNo: { type: String, trim: true },
    prescriptionRequired: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    availability: { type: Boolean, default: true },
    stockOver: { type: Boolean, default: false },
    imageUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

MedicineSchema.index({ name: 1, brand: 1 });

module.exports = mongoose.model('Medicine', MedicineSchema);
