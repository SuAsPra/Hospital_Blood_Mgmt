const mongoose = require('mongoose');

const BloodBatchSchema = new mongoose.Schema(
  {
    quantity: { type: Number, min: 0, required: true },
    expiryDate: { type: Date, required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const BloodStockSchema = new mongoose.Schema(
  {
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      unique: true,
      required: true,
    },
    totalUnits: { type: Number, min: 0, default: 0 },
    reservedUnits: { type: Number, min: 0, default: 0 },
    isClosed: { type: Boolean, default: false },
    batches: [BloodBatchSchema],
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BloodStock', BloodStockSchema);
