const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if DB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('\x1b[33m⚠\x1b[0m DB Offline: Bypassing Profile Verification for Demo');
      
      // Assign mock user based on decoded ID (or just a default admin for demo)
      req.user = {
        id: decoded.id,
        name: decoded.role === 'admin' ? 'Demo Admin' : 'Demo Student',
        email: decoded.role === 'admin' ? 'admin@edu.com' : 'student@edu.com',
        role: decoded.role || 'user',
        status: 'active'
      };
      return next();
    }

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ErrorResponse('No user found with this id', 404));
    }

    if (req.user.status === 'blocked') {
      return next(new ErrorResponse('Your account has been blocked', 403));
    }

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
