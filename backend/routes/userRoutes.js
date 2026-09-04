const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, updateMyProfile, updateUserSettings } = require('../controllers/userController');
const { verifyToken, optionalAuth } = require('../middleware/auth');

// NOTE: /profile must be defined before /:id to prevent Express matching
// the literal string 'profile' as a dynamic user ID.
router.put('/profile', verifyToken, updateMyProfile);
router.patch('/profile', verifyToken, updateMyProfile); // alias for PATCH clients
router.get('/:id', optionalAuth, getUserProfile);
router.patch('/:id', verifyToken, updateUserProfile);
router.patch('/:id/settings', verifyToken, updateUserSettings);

module.exports = router;
