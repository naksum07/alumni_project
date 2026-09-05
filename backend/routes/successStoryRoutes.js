const express = require('express');
const router = express.Router();
const {
  createSuccessStory,
  getMySuccessStory,
  updateSuccessStory,
  deleteSuccessStory,
  getApprovedSuccessStories
} = require('../controllers/successStoryController');
const { requireAlumni } = require('../middleware/auth');

// Public route for homepage carousel
router.get('/public', getApprovedSuccessStories);

// Alumni-only protected routes
router.get('/my-story', requireAlumni, getMySuccessStory);
router.post('/', requireAlumni, createSuccessStory);
router.put('/:id', requireAlumni, updateSuccessStory);
router.delete('/:id', requireAlumni, deleteSuccessStory);

module.exports = router;
