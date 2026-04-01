const { Admin, Doctor, Patient, Appointment, BloodStock, Order } = require('../models');
const generateToken = require('../utils/generateToken');

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
};

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
  if (!admin || !admin.isActive) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }

  const ok = await admin.comparePassword(password);
  if (!ok) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }

  const token = generateToken(admin);

  return res.json({
    token,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
};

const getAllDoctorsForAdmin = async (req, res) => {
  const doctors = await Doctor.find()
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });

  const result = doctors.map((doc) => ({
    id: doc._id,
    name: doc.user?.name || null,
    specialization: doc.specialization,
    department: doc.department,
    availability: doc.availability,
    contact: {
      email: doc.user?.email || null,
      phone: doc.user?.phone || null,
    },
    room: doc.room || null,
    isAvailable: doc.isAvailable,
  }));

  return res.json({ doctors: result });
};

const getDoctorDetailsForAdmin = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate('user', 'name email phone');
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  return res.json({
    doctor: {
      id: doctor._id,
      doctorId: doctor.doctorId,
      name: doctor.user?.name || null,
      email: doctor.user?.email || null,
      phone: doctor.user?.phone || null,
      specialization: doctor.specialization,
      department: doctor.department,
      qualifications: doctor.qualifications || [],
      experienceYears: doctor.experienceYears ?? null,
      fee: doctor.fee ?? null,
      room: doctor.room || null,
      availability: doctor.availability || [],
      isAvailable: doctor.isAvailable,
    },
  });
};

const getAllPatientsForAdmin = async (req, res) => {
  const patients = await Patient.find()
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });

  const result = patients.map((patient) => ({
    id: patient._id,
    name: patient.user?.name || null,
    age: calculateAge(patient.dateOfBirth),
    gender: patient.gender || null,
    bloodGroup: patient.bloodGroup || null,
    medicalHistory: {
      allergies: patient.allergies || [],
      conditions: patient.conditions || [],
    },
    admissionStatus: patient.admissionStatus,
    contact: {
      email: patient.user?.email || null,
      phone: patient.user?.phone || null,
    },
  }));

  return res.json({ patients: result });
};

const getAllAppointmentsForAdmin = async (req, res) => {
  const appointments = await Appointment.find()
    .populate({
      path: 'patient',
      select: 'user',
      populate: { path: 'user', select: 'name' },
    })
    .populate({
      path: 'doctor',
      select: 'user specialization department',
      populate: { path: 'user', select: 'name' },
    })
    .sort({ appointmentDate: -1, createdAt: -1 });

  const result = appointments.map((appointment) => ({
    id: appointment._id,
    patient: appointment.patient?.user?.name || null,
    doctor: appointment.doctor?.user?.name || null,
    specialization: appointment.doctor?.specialization || null,
    department: appointment.department,
    date: appointment.appointmentDate,
    timeSlot: appointment.timeSlot,
    status: appointment.status,
    notes: appointment.notes || '',
  }));

  return res.json({ appointments: result });
};

const updateAppointmentForAdmin = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  const allowedFields = ['appointmentDate', 'timeSlot', 'status', 'notes'];
  for (const field of allowedFields) {
    if (field in req.body) {
      appointment[field] = req.body[field];
    }
  }

  await appointment.save();
  return res.json({ appointment });
};

const getBloodStatusForAdmin = async (req, res) => {
  const stock = await BloodStock.find().sort({ bloodGroup: 1 });

  const result = stock.map((item) => {
    const sortedBatches = [...(item.batches || [])].sort(
      (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)
    );
    const nearestExpiry = sortedBatches.length ? sortedBatches[0].expiryDate : null;

    return {
      id: item._id,
      bloodGroup: item.bloodGroup,
      totalUnits: item.totalUnits,
      reservedUnits: item.reservedUnits,
      isClosed: !!item.isClosed,
      availableUnits: Math.max(0, item.totalUnits - item.reservedUnits),
      nearestExpiry,
      batches: sortedBatches,
      lastUpdated: item.lastUpdated,
    };
  });

  return res.json({ blood: result });
};

const reduceBloodSupplyForAdmin = async (req, res) => {
  const units = Number(req.body.units || 0);
  if (!units || units <= 0) {
    return res.status(400).json({ message: 'units must be greater than 0' });
  }

  const blood = await BloodStock.findById(req.params.id);
  if (!blood) {
    return res.status(404).json({ message: 'Blood stock not found' });
  }

  blood.totalUnits = Math.max(0, blood.totalUnits - units);
  blood.reservedUnits = Math.min(blood.reservedUnits, blood.totalUnits);
  blood.lastUpdated = new Date();
  await blood.save();

  return res.json({ blood });
};

const closeBloodSupplyForAdmin = async (req, res) => {
  const blood = await BloodStock.findById(req.params.id);
  if (!blood) {
    return res.status(404).json({ message: 'Blood stock not found' });
  }

  blood.isClosed = !!req.body.isClosed;
  blood.lastUpdated = new Date();
  await blood.save();

  return res.json({ blood });
};

const updatePatientMedicalHistoryForAdmin = async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  if (Array.isArray(req.body.allergies)) {
    patient.allergies = req.body.allergies;
  }
  if (Array.isArray(req.body.conditions)) {
    patient.conditions = req.body.conditions;
  }

  await patient.save();
  return res.json({ patient });
};

const getAllOrdersForAdmin = async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email role')
    .sort({ createdAt: -1 });

  return res.json({ orders });
};

const updateOrderStatusForAdmin = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (req.body.status) {
    order.status = req.body.status;
  }
  await order.save();
  return res.json({ order });
};

module.exports = {
  loginAdmin,
  getAllDoctorsForAdmin,
  getDoctorDetailsForAdmin,
  getAllPatientsForAdmin,
  updatePatientMedicalHistoryForAdmin,
  getAllAppointmentsForAdmin,
  updateAppointmentForAdmin,
  getBloodStatusForAdmin,
  reduceBloodSupplyForAdmin,
  closeBloodSupplyForAdmin,
  getAllOrdersForAdmin,
  updateOrderStatusForAdmin,
};
