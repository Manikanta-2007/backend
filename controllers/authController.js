const mongoose = require('mongoose');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { users: mockUsers } = require('../utils/sampleData');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  const { name, email, password, role, secretKey } = req.body;

  try {
    // Check if DB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('\x1b[33m⚠\x1b[0m DB Offline: Mocking Successful Registration');
      return res.status(201).json({
        success: true,
        message: 'Account created successfully (Demo Mode)',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new ErrorResponse('User already exists', 400));
    }

    let assignedRole = 'user';
    if (role === 'admin') {
      if (secretKey === 'admin123') {
        assignedRole = 'admin';
      } else {
        return next(new ErrorResponse('Invalid admin secret key', 400));
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
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Check if DB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('\x1b[33m⚠\x1b[0m DB Offline: Mocking Successful Login for any credentials');
      
      // Look for match in mock users, otherwise return a default profile
      const isDemoAdmin = email && email.toLowerCase().includes('admin');
      const user = mockUsers.find(u => u.email === email) || {
        name: isDemoAdmin ? 'Demo Admin' : 'Demo User',
        email: email || 'demo@edu.com',
        role: isDemoAdmin ? 'admin' : 'user',
        status: 'active'
      };
      
      return sendTokenResponse({ ...user, _id: 'mock_id' }, 200, res, `Login successful (Demo ${isDemoAdmin ? 'Admin' : 'User'})`);
    }

    // Validate email & password
    if (!email || !password) {
      return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid email or password', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid email or password', 401));
    }

    if (user.status === 'blocked') {
      return next(new ErrorResponse('Your account has been blocked', 403));
    }

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // If DB is offline, return a mock user
    if (mongoose.connection.readyState !== 1) {
        return res.status(200).json({
            success: true,
            data: req.user || { id: 'mock_id', name: 'Demo User', email: 'demo@edu.com', role: 'user' }
        });
    }

    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
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
    },
    message: message || (statusCode === 201 ? 'Account created successfully' : 'Success'),
  });
};
