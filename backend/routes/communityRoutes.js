const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { verifyToken, optionalAuth } = require('../middleware/auth');

router.get('/posts', optionalAuth, communityController.getPosts);
router.post('/posts', verifyToken, communityController.createPost);
router.put('/posts/:id', verifyToken, communityController.updatePost);
router.delete('/posts/:id', verifyToken, communityController.deletePost);

router.post('/posts/:id/like', verifyToken, communityController.toggleLike);

router.post('/posts/:id/comments', verifyToken, communityController.addComment);
router.put('/comments/:id', verifyToken, communityController.updateComment);
router.delete('/comments/:id', verifyToken, communityController.deleteComment);

module.exports = router;
