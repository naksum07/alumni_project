const express = require('express');
const router = express.Router();
const { searchAlumni, getAlumniProfile } = require('../controllers/alumniController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, searchAlumni);
router.get('/:id', optionalAuth, getAlumniProfile);

module.exports = router;
