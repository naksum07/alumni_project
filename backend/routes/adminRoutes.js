const express = require('express');
const router = express.Router();
const {
  listUsers,
  approveUser,
  rejectUser,
  updateUserStatus,
  deleteUser,
  createEvent,
  updateEvent,
  deleteEvent,
  listEventRegistrations,
} = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// All admin routes require a valid token AND the admin role
router.use(verifyToken, verifyAdmin);

// User management
router.get('/users', listUsers);
router.put('/users/:id/approve', approveUser);
router.put('/users/:id/reject', rejectUser);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Event management
router.post('/events', createEvent);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);
router.get('/events/:id/registrations', listEventRegistrations);

module.exports = router;
