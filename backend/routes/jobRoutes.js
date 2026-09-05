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
  getMyApplications,
  getMyPostedJobs,
} = require('../controllers/jobController');
const { verifyToken, optionalAuth, requireStudent } = require('../middleware/auth');

// Public browsing
router.get('/', listJobs);
router.get('/my-applications', verifyToken, getMyApplications);
router.get('/my-posted-jobs', verifyToken, getMyPostedJobs);
router.get('/:id', getJobById);

// Restrict applications to registered/logged-in students
router.post('/:id/apply', requireStudent, applyToJob);

// Requires login — posting, editing, closing, deleting a job, viewing its applicants
router.post('/', verifyToken, postJob);
router.put('/:id', verifyToken, updateJob);
router.put('/:id/close', verifyToken, closeJob);
router.delete('/:id', verifyToken, deleteJob);
router.get('/:id/applications', verifyToken, listApplications);

module.exports = router;
