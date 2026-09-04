const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, updateMyProfile, updateUserSettings } = require('../controllers/userController');
const { verifyToken, optionalAuth } = require('../middleware/auth');

router.put('/profile', verifyToken, updateMyProfile);
router.get('/:id', optionalAuth, getUserProfile);
router.patch('/:id', verifyToken, updateUserProfile);
router.patch('/:id/settings', verifyToken, updateUserSettings);

module.exports = router;
