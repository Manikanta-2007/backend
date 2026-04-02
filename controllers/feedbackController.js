const ErrorResponse = require('../utils/errorResponse');
const Feedback = require('../models/Feedback');

// @desc    Get all feedback for a resource
// @route   GET /api/feedback/resource/:resourceId
// @access  Public
exports.getResourceFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ resourceId: req.params.resourceId })
      .populate('userId', 'name role')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all feedback (Admin)
// @route   GET /api/feedback
// @access  Private/Admin
exports.getAllFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find()
      .populate('userId', 'name email role')
      .populate('resourceId', 'title')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add feedback for a resource
// @route   POST /api/feedback
// @access  Private
exports.addFeedback = async (req, res, next) => {
  try {
    req.body.userId = req.user.id;

    const feedback = await Feedback.create(req.body);

    res.status(201).json({
      success: true,
      data: feedback,
    });
  } catch (err) {
    next(err);
  }
};
