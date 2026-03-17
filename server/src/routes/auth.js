const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { sendOTPEmail, isEmailConfigured } = require('../services/email');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

/** Generate a 6-digit numeric OTP */
function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// POST /api/auth/register
const register = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, email, password, aadhaarVerified = false, phone = null } = req.body;

      // Check duplicate
      const existing = await User.findOne({ email });
      if (existing && existing.isEmailVerified) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      // Generate OTP
      const otp = generateOTP();
      const otpHash = await bcrypt.hash(otp, 10);
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

      let user;
      if (existing && !existing.isEmailVerified) {
        // Resend OTP to same unverified account (update it)
        existing.name = name;
        existing.password = password; // will be re-hashed by pre-save hook
        existing.phone = phone;
        existing.otp = otpHash;
        existing.otpExpiresAt = otpExpiresAt;
        user = await existing.save();
      } else {
        user = await User.create({
          name, email, password, aadhaarVerified,
          phone,
          isEmailVerified: false,
          otp: otpHash,
          otpExpiresAt,
        });
      }

      // Send OTP email (non-blocking if not configured — logs OTP in dev)
      await sendOTPEmail(email, name, otp);

      const emailConfigured = isEmailConfigured();
      res.status(201).json({
        message: emailConfigured
          ? `Verification code sent to ${email}. Please check your inbox.`
          : `[DEV MODE] Email not configured. OTP logged to server console.`,
        email,
        emailConfigured,
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },
];

// POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'Account not found' });
    if (user.isEmailVerified) return res.status(400).json({ message: 'Email already verified. Please log in.' });
    if (!user.otp || !user.otpExpiresAt) return res.status(400).json({ message: 'No OTP found. Please register again.' });
    if (new Date() > user.otpExpiresAt) return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });

    const isValid = await bcrypt.compare(String(otp), user.otp);
    if (!isValid) return res.status(400).json({ message: 'Invalid OTP. Please try again.' });

    // Mark verified and clear OTP
    user.isEmailVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/auth/resend-otp
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'Account not found. Please register first.' });
    if (user.isEmailVerified) return res.status(400).json({ message: 'Email already verified. Please log in.' });

    const otp = generateOTP();
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(email, user.name, otp);

    res.json({ message: `A new verification code has been sent to ${email}.` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/auth/login
const login = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Block unverified accounts
      if (!user.isEmailVerified) {
        return res.status(403).json({
          message: 'Please verify your email before logging in.',
          needsVerification: true,
          email: user.email,
        });
      }

      const token = generateToken(user._id);
      res.json({ token, user });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },
];

// GET /api/auth/me
const me = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, me, verifyOtp, resendOtp };
