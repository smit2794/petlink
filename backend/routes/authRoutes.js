const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'petlink_secret_key_279';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

const sanitizeUser = (user) => {
  return {
    id: user._id,
    email: user.email,
    role: user.role,
    name: user.name,
    phone: user.phone || '',
    address: user.address || '',
    city: user.city || '',
    ngoProfile: user.ngoProfile || {},
    vetProfile: user.vetProfile || {},
    parentProfile: user.parentProfile || {},
    createdAt: user.createdAt
  };
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const {
      email,
      password,
      role,
      name,
      phone,
      address,
      city,
      region,
      clinicName,
      licenseNumber
    } = req.body;

    if (!email || !password || !role || !name || !address || !city) {
      return res.status(400).json({ error: 'Please provide all required fields: email, password, role, name, address, city.' });
    }

    if (!['ngo', 'vet', 'parent'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be ngo, vet, or parent.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const userData = {
      email: email.toLowerCase().trim(),
      password,
      role,
      name: name.trim(),
      phone: phone ? phone.trim() : '',
      address: address.trim(),
      city: city.trim(),
      ngoProfile: role === 'ngo' ? { region: region || '' } : undefined,
      vetProfile: role === 'vet' ? { clinicName: clinicName || '', licenseNumber: licenseNumber || '' } : undefined,
      parentProfile: role === 'parent' ? {} : undefined
    };

    const user = await User.create(userData);
    const token = generateToken(user);

    return res.status(201).json({
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // If a specific role tab was selected on the login page, verify role match
    if (role && user.role !== role) {
      return res.status(403).json({
        error: `This account is registered as a ${user.role.toUpperCase()}, not ${role.toUpperCase()}. Please select the correct role tab.`
      });
    }

    const token = generateToken(user);

    return res.json({
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me — restore session
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }
    return res.json({
      user: sanitizeUser(user)
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
