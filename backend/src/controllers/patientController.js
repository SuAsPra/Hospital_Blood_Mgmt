const { Patient } = require('../models');

const createPatient = async (req, res) => {
  const { user, dateOfBirth, gender, bloodGroup, address, emergencyContact, allergies, conditions } = req.body;

  const userId = req.user.role === 'public' ? req.user._id : user;

  if (!userId) {
    return res.status(400).json({ message: 'User is required' });
  }

  const patient = await Patient.create({
    user: userId,
    dateOfBirth,
    gender,
    bloodGroup,
    address,
    emergencyContact,
    allergies,
    conditions,
  });

  return res.status(201).json({ patient });
};

const listPatients = async (req, res) => {
  const patients = await Patient.find().populate('user', 'name email role');
  return res.json({ patients });
};

const getMyPatient = async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id }).populate('user', 'name email role');
  if (!patient) {
    return res.status(404).json({ message: 'Patient profile not found' });
  }
  return res.json({ patient });
};

const getPatient = async (req, res) => {
  const patient = await Patient.findById(req.params.id).populate('user', 'name email role');
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  const isOwner = req.user && patient.user && patient.user._id.toString() === req.user._id.toString();
  const isStaff = req.user && req.user.role !== 'public';
  if (!isOwner && !isStaff) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  return res.json({ patient });
};

const updatePatient = async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  const updates = req.body;
  Object.assign(patient, updates);
  await patient.save();

  return res.json({ patient });
};

const admitPatient = async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }
  patient.admissionStatus = 'admitted';
  patient.admittedAt = new Date();
  patient.dischargedAt = null;
  await patient.save();
  return res.json({ patient });
};

const dischargePatient = async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }
  patient.admissionStatus = 'discharged';
  patient.dischargedAt = new Date();
  await patient.save();
  return res.json({ patient });
};

module.exports = {
  createPatient,
  listPatients,
  getMyPatient,
  getPatient,
  updatePatient,
  admitPatient,
  dischargePatient,
};
