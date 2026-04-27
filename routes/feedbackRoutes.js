const express = require('express');
const { getResourceFeedback, getFeedback, createFeedback } = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/resource/:resourceId', getResourceFeedback);
router.get('/', protect, authorize('admin'), getFeedback);
router.post('/', protect, createFeedback);

module.exports = router;
