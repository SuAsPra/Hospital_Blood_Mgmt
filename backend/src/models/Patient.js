const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientId: { type: String, unique: true, index: true },
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    address: { type: String, trim: true },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    allergies: [String],
    conditions: [String],
    admissionStatus: {
      type: String,
      enum: ['none', 'admitted', 'discharged'],
      default: 'none',
    },
    admittedAt: Date,
    dischargedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', PatientSchema);
