const express = require('express');
const router = express.Router();
const {
  listJobs,
  getJobById,
  postJob,
  updateJob,
  closeJob,
  deleteJob,
  applyToJob,
  listApplications,
} = require('../controllers/jobController');
const { verifyToken, optionalAuth } = require('../middleware/auth');

// Public browsing
router.get('/', listJobs);
router.get('/:id', getJobById);

// Public application (optionalAuth: works logged-in or as a guest)
router.post('/:id/apply', optionalAuth, applyToJob);

// Requires login — posting, editing, closing, deleting a job, viewing its applicants
router.post('/', verifyToken, postJob);
router.put('/:id', verifyToken, updateJob);
router.put('/:id/close', verifyToken, closeJob);
router.delete('/:id', verifyToken, deleteJob);
router.get('/:id/applications', verifyToken, listApplications);

module.exports = router;
