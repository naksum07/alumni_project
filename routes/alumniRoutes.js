const express = require('express');
const router = express.Router();
const { searchAlumni, getAlumniProfile } = require('../controllers/alumniController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, searchAlumni);
router.get('/:id', verifyToken, getAlumniProfile);

module.exports = router;