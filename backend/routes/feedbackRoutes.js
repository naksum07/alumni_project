const express = require('express');
const router = express.Router();
const { getFeedback, submitFeedback } = require('../controllers/feedbackController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', getFeedback);                    // GET  /api/feedback
router.post('/', optionalAuth, submitFeedback);  // POST /api/feedback

module.exports = router;