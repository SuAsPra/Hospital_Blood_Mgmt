const { Admin, User, Doctor } = require('../models');
const generateToken = require('../utils/generateToken');

const register = async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    role,
    department,
    specialization,
    qualifications,
    experienceYears,
    fee,
    room,
    availability,
    adminRegisterKey,
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  const normalizedEmail = email.toLowerCase();
  const allowedRoles = ['public', 'doctor', 'admin'];
  const desiredRole = role && allowedRoles.includes(role) ? role : 'public';

  if (role && !allowedRoles.includes(role)) {
    return res.status(403).json({ message: 'Role not allowed' });
  }

  if (desiredRole === 'doctor' && (!department || !specialization)) {
    return res.status(400).json({ message: 'Department and specialization are required for doctors' });
  }

  if (desiredRole === 'admin' && process.env.ADMIN_REGISTER_KEY) {
    if (adminRegisterKey !== process.env.ADMIN_REGISTER_KEY) {
      return res.status(403).json({ message: 'Invalid admin registration key' });
    }
  }

  const [existingUser, existingAdmin] = await Promise.all([
    User.findOne({ email: normalizedEmail }),
    Admin.findOne({ email: normalizedEmail }),
  ]);

  if (existingUser || existingAdmin) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  if (desiredRole === 'admin') {
    try {
      const admin = await Admin.create({
        name,
        email: normalizedEmail,
        password,
        role: 'admin',
      });

      const token = generateToken(admin);
      return res.status(201).json({
        token,
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      });
    } catch (err) {
      if (err && err.code === 11000) {
        return res.status(409).json({ message: 'Duplicate key error' });
      }
      return res.status(500).json({ message: 'Registration failed' });
    }
  }

  let user;
  try {
    user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: desiredRole,
      phone,
    });

    if (desiredRole === 'doctor') {
      await Doctor.create({
        user: user._id,
        department,
        specialization,
        qualifications,
        experienceYears,
        fee,
        room,
        availability,
      });
    }
  } catch (err) {
    if (user) {
      await User.deleteOne({ _id: user._id });
    }
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'Duplicate key error' });
    }
    return res.status(500).json({ message: 'Registration failed' });
  }

  const token = generateToken(user);

  return res.status(201).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !user.isActive) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const ok = await user.comparePassword(password);
  if (!ok) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = generateToken(user);

  return res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

const me = async (req, res) => {
  return res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

module.exports = { register, login, me };
