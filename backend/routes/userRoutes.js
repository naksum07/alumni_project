const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, updateUserSettings } = require('../controllers/userController');
const { verifyToken, optionalAuth } = require('../middleware/auth');

router.get('/:id', optionalAuth, getUserProfile);
router.patch('/:id', verifyToken, updateUserProfile);
router.patch('/:id/settings', verifyToken, updateUserSettings);

module.exports = router;
