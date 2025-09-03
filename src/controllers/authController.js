const authService = require('../services/authService');
const adminService = require('../services/adminService');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const payload = { 
    id: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};
const register = async (req, res) => {
  try {
    const { email, password, name, adminCode } = req.body;

    const existingUser = await authService.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    let role = 'USER';
    if (adminCode) {
      const storedAdminCode = await adminService.findAdminCode(adminCode);
      if (storedAdminCode) {
        role = 'ADMIN';
      }
    }

    const newUser = await authService.createUser({ email, password, name, role });
    const token = generateToken(newUser);

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.findUserByEmail(email);

    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await authService.validatePassword(password, user);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user);
    res.status(200).json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

const getMe = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  res.status(200).json({ user: req.user });
};

module.exports = {
  register,
  login,
  getMe,
};
