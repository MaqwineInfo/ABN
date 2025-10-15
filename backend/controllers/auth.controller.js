const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL;
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

// default login for admin
exports.login = async (req, res) => {
    const { email, password } = req.body;

    console.log("Login attempt:");
    console.log("Email match:", email === DEFAULT_ADMIN_EMAIL);
    console.log("Password sent:", password);
    console.log("Expected password:", DEFAULT_ADMIN_PASSWORD.replace(/"/g, ''));

    try {
        if (email !== DEFAULT_ADMIN_EMAIL) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (password !== DEFAULT_ADMIN_PASSWORD.replace(/"/g, '')) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1d' });

        res.json({ token, message: 'Login successful' });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
}; 

// admin login
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  console.log("Admin login attempt for email:", email);
  try { 
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    } 
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Not an admin' });
    } 
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    } 
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    ); 
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};