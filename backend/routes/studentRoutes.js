const express = require('express');
const router = express.Router();
const { searchStudents, getStudentProfile } = require('../controllers/studentController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, searchStudents);
router.get('/:id', optionalAuth, getStudentProfile);

module.exports = router;
