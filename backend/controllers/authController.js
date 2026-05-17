import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

export const registerUser = async (req, res) => {
  const { name, email, password, role, specialization } = req.body;

  // Input validation
  const requiredFields = { name, email, password, role };
  for (const [field, value] of Object.entries(requiredFields)) {
    if (!value || typeof value !== 'string') {
      return res.status(400).json({ message: `${field} is required` });
    }
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  if (!['patient', 'doctor', 'admin', 'pharmacy'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      specialization: specialization?.trim() || ''
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed: ' + Object.values(error.errors)[0].message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
