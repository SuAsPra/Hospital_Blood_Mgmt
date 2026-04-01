const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { User, Doctor, Medicine, BloodStock } = require('./models');

dotenv.config();

const doctorsSeed = [
  {
    name: 'Dr. Kavya Sharma',
    email: 'kavya@demo.com',
    password: 'Password123',
    phone: '9991112222',
    department: 'Cardiology',
    specialization: 'Heart Surgery',
    qualifications: ['MBBS', 'MD', 'DM'],
    experienceYears: 12,
    fee: 800,
    room: 'C-201',
    availability: [{ day: 'mon', startTime: '10:00', endTime: '16:00' }],
    photoUrl: 'https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Dr. Arjun Patel',
    email: 'arjun@demo.com',
    password: 'Password123',
    phone: '9993334444',
    department: 'Orthopedics',
    specialization: 'Joint Replacement',
    qualifications: ['MBBS', 'MS'],
    experienceYears: 9,
    fee: 600,
    room: 'B-102',
    availability: [{ day: 'tue', startTime: '09:00', endTime: '13:00' }],
    photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
  },
];

const medicinesSeed = [
  {
    name: 'Paracetamol 500mg',
    brand: 'MediCare',
    category: 'Pain Relief',
    form: 'Tablet',
    strength: '500mg',
    price: 25,
    stockQty: 120,
    expiryDate: new Date('2027-10-31'),
    batchNo: 'PCM-2026-01',
    prescriptionRequired: false,
    isActive: true,
    availability: true,
    imageUrl: 'https://images.unsplash.com/photo-1580281657521-6b2e43f39bf8?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Amoxicillin 250mg',
    brand: 'HealWell',
    category: 'Antibiotic',
    form: 'Capsule',
    strength: '250mg',
    price: 90,
    stockQty: 60,
    expiryDate: new Date('2026-12-15'),
    batchNo: 'AMX-2026-07',
    prescriptionRequired: true,
    isActive: true,
    availability: true,
    imageUrl: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Cetirizine 10mg',
    brand: 'AllerFree',
    category: 'Allergy',
    form: 'Tablet',
    strength: '10mg',
    price: 35,
    stockQty: 90,
    expiryDate: new Date('2027-05-20'),
    batchNo: 'CTZ-2026-04',
    prescriptionRequired: false,
    isActive: true,
    availability: true,
    imageUrl: 'https://images.unsplash.com/photo-1580281658629-9f1d7b5c1b12?auto=format&fit=crop&w=400&q=80',
  },
];

const bloodSeed = [
  {
    bloodGroup: 'A+',
    totalUnits: 24,
    reservedUnits: 2,
    batches: [
      { quantity: 10, expiryDate: new Date('2026-04-15') },
      { quantity: 14, expiryDate: new Date('2026-05-05') },
    ],
  },
  {
    bloodGroup: 'O+',
    totalUnits: 18,
    reservedUnits: 1,
    batches: [
      { quantity: 8, expiryDate: new Date('2026-04-20') },
      { quantity: 10, expiryDate: new Date('2026-05-10') },
    ],
  },
  {
    bloodGroup: 'B+',
    totalUnits: 12,
    reservedUnits: 0,
    batches: [{ quantity: 12, expiryDate: new Date('2026-05-25') }],
  },
];

const upsertDoctor = async (data) => {
  const email = data.email.toLowerCase();
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name: data.name,
      email,
      password: data.password,
      role: 'doctor',
      phone: data.phone,
    });
  }

  await Doctor.findOneAndUpdate(
    { user: user._id },
    {
      user: user._id,
      department: data.department,
      specialization: data.specialization,
      qualifications: data.qualifications,
      experienceYears: data.experienceYears,
      fee: data.fee,
      room: data.room,
      availability: data.availability,
      isAvailable: true,
      photoUrl: data.photoUrl,
    },
    { upsert: true, new: true }
  );
};

const upsertMedicine = async (data) => {
  await Medicine.findOneAndUpdate(
    { name: data.name, brand: data.brand },
    data,
    { upsert: true, new: true }
  );
};

const upsertBlood = async (data) => {
  await BloodStock.findOneAndUpdate(
    { bloodGroup: data.bloodGroup },
    { ...data, lastUpdated: new Date() },
    { upsert: true, new: true }
  );
};

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI not set');
  }

  await mongoose.connect(process.env.MONGO_URI);

  for (const doc of doctorsSeed) {
    await upsertDoctor(doc);
  }

  for (const med of medicinesSeed) {
    await upsertMedicine(med);
  }

  for (const group of bloodSeed) {
    await upsertBlood(group);
  }

  await mongoose.disconnect();
  console.log('Seed complete');
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
