const express = require('express');
const { getResourceFeedback, getAllFeedback, addFeedback } = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/resource/:resourceId', getResourceFeedback);
router.get('/', protect, authorize('admin'), getAllFeedback);
router.post('/', protect, addFeedback);

module.exports = router;
