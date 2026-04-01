const { Doctor } = require('../models');

const createDoctor = async (req, res) => {
  const { user, department, specialization, qualifications, experienceYears, fee, room, availability } = req.body;
  if (!user || !department || !specialization) {
    return res.status(400).json({ message: 'User, department, and specialization are required' });
  }

  const doctor = await Doctor.create({
    user,
    department,
    specialization,
    qualifications,
    experienceYears,
    fee,
    room,
    availability,
  });

  return res.status(201).json({ doctor });
};

const listDoctors = async (req, res) => {
  const doctors = await Doctor.find().populate('user', 'name email');
  return res.json({ doctors });
};

const getDoctor = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate('user', 'name email');
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }
  return res.json({ doctor });
};

const getMyDoctor = async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id }).populate('user', 'name email');
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor profile not found' });
  }
  return res.json({ doctor });
};

const updateDoctor = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  Object.assign(doctor, req.body);
  await doctor.save();
  return res.json({ doctor });
};

const updateMyDoctor = async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor profile not found' });
  }

  const allowed = ['department', 'specialization', 'qualifications', 'experienceYears', 'fee', 'room', 'availability', 'isAvailable'];
  allowed.forEach((key) => {
    if (key in req.body) doctor[key] = req.body[key];
  });

  await doctor.save();
  return res.json({ doctor });
};

module.exports = { createDoctor, listDoctors, getDoctor, getMyDoctor, updateDoctor, updateMyDoctor };
