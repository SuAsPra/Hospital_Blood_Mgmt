const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const DoctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: {
      type: String,
      unique: true,
      index: true,
      default: () => `DOC-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    },
    department: { type: String, required: true },
    specialization: { type: String, required: true },
    qualifications: [String],
    experienceYears: { type: Number, min: 0 },
    fee: { type: Number, min: 0 },
    room: { type: String, trim: true },
    availability: [AvailabilitySchema],
    isAvailable: { type: Boolean, default: true },
    photoUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', DoctorSchema);
