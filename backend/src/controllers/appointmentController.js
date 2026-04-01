const { Appointment, Patient, Doctor } = require('../models');

const createAppointment = async (req, res) => {
  const { patient, doctor, department, appointmentDate, timeSlot, reason } = req.body;
  if (!doctor || !department || !appointmentDate || !timeSlot) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  let patientId = patient;
  if (req.user.role === 'public') {
    const record = await Patient.findOne({ user: req.user._id });
    if (!record) {
      return res.status(400).json({ message: 'Patient profile not found' });
    }
    patientId = record._id;
  }

  if (!patientId) {
    return res.status(400).json({ message: 'Patient is required' });
  }

  const appointment = await Appointment.create({
    patient: patientId,
    doctor,
    department,
    appointmentDate,
    timeSlot,
    reason,
    status: 'pending',
  });

  return res.status(201).json({ appointment });
};

const listAppointments = async (req, res) => {
  const filter = {};
  if (req.user.role === 'public') {
    const record = await Patient.findOne({ user: req.user._id });
    if (!record) {
      return res.json({ appointments: [] });
    }
    filter.patient = record._id;
  }

  const appointments = await Appointment.find(filter)
    .populate('patient', 'user')
    .populate('doctor', 'user department specialization');

  return res.json({ appointments });
};

const getAppointment = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patient', 'user')
    .populate('doctor', 'user department specialization');
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }
  return res.json({ appointment });
};

const updateAppointment = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  const role = req.user.role;
  const payload = req.body || {};

  if (role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const allowed = ['appointmentDate', 'timeSlot', 'status', 'notes'];
    allowed.forEach((key) => {
      if (key in payload) appointment[key] = payload[key];
    });
  } else if (role === 'nurse') {
    const allowed = ['status', 'notes'];
    allowed.forEach((key) => {
      if (key in payload) appointment[key] = payload[key];
    });
  } else {
    Object.assign(appointment, payload);
  }

  await appointment.save();
  return res.json({ appointment });
};

module.exports = { createAppointment, listAppointments, getAppointment, updateAppointment };
