const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Admin } = require('./models');

dotenv.config();

const run = async () => {
  const { MONGO_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!MONGO_URI) throw new Error('MONGO_URI not set');
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
  }

  await mongoose.connect(MONGO_URI);

  const existing = await Admin.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    existing.name = ADMIN_NAME || existing.name;
    existing.password = ADMIN_PASSWORD;
    existing.isActive = true;
    await existing.save();
    console.log('Admin account updated');
  } else {
    await Admin.create({
      name: ADMIN_NAME || 'System Admin',
      email: ADMIN_EMAIL.toLowerCase(),
      password: ADMIN_PASSWORD,
      role: 'admin',
    });
    console.log('Admin account created');
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
