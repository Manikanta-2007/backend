const mongoose = require('mongoose');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { users: mockUsers } = require('../utils/sampleData');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const { name, email, password, role, secretKey } = req.body;

  try {


    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    let assignedRole = 'user';
    if (role === 'admin') {
      if (secretKey === 'admin123') {
        assignedRole = 'admin';
      } else {
        return res.status(400).json({ success: false, error: 'Invalid admin secret key' });
      }
    }

    // Create user
    await User.create({
      name,
      email,
      password,
      role: assignedRole,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Server Error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {


    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, error: 'Your account has been blocked' });
    }

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Server Error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {


    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Server Error' });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ success: false, error: 'Email not registered' });
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Server Error' });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ success: false, error: 'Please provide email and new password' });
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Server Error' });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, message = '') => {
  // Create token
  const token = jwt.sign({ id: user._id || user.id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d',
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
    message: message || (statusCode === 201 ? 'Account created successfully' : 'Success'),
  });
};
