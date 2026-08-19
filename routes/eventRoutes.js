const express = require('express');
const router = express.Router();
const { listEvents, registerForEvent } = require('../controllers/eventController');

router.get('/', listEvents);
router.post('/:id/register', registerForEvent);

module.exports = router;