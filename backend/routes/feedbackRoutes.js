const express = require('express');
const router = express.Router();
const { submitFeedback } = require('../controllers/feedbackController');
const { optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, submitFeedback);

module.exports = router;