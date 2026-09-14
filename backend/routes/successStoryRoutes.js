const express = require('express');
const router = express.Router();
const {
  createSuccessStory,
  getMySuccessStory,
  updateSuccessStory,
  deleteSuccessStory,
  getApprovedSuccessStories,
  getPublicSuccessStoryById
} = require('../controllers/successStoryController');
const { requireAlumni } = require('../middleware/auth');

// Public routes for homepage carousel and story detail page
router.get('/public', getApprovedSuccessStories);
router.get('/public/:id', getPublicSuccessStoryById);

// Alumni-only protected routes
router.get('/my-story', requireAlumni, getMySuccessStory);
router.post('/', requireAlumni, createSuccessStory);
router.put('/:id', requireAlumni, updateSuccessStory);
router.delete('/:id', requireAlumni, deleteSuccessStory);

module.exports = router;
