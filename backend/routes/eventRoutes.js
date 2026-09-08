const express = require('express');
const router = express.Router();
const { listEvents, registerForEvent } = require('../controllers/eventController');

router.get('/', listEvents);
const { optionalAuth } = require('../middleware/auth');
router.post('/:id/register', optionalAuth, registerForEvent);

module.exports = router;