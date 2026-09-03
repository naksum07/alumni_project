const express = require('express');
const router = express.Router();
const {
  listUsers,
  approveUser,
  rejectUser,
  updateUserStatus,
  deleteUser,
  listEventsAdmin,
  createEvent,
  updateEvent,
  deleteEvent,
  listEventRegistrations,
  getDashboardStats,
  listNews,
  createNews,
  toggleNewsStatus,
  deleteNews,
  deleteFeedback,
  listAnnouncements,
  createAnnouncement,
  toggleAnnouncementStatus,
  deleteAnnouncement,
} = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/auth');


const { adminLogin } = require('../controllers/authController');

// Public route for admin login
router.post('/login', adminLogin);

router.use(requireAdmin);
// requireAdmin already calls verifyToken internally

// User management
router.get('/users', listUsers);
router.put('/users/:id/approve', approveUser);
router.put('/users/:id/reject', rejectUser);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Event management
router.get('/events', listEventsAdmin);
router.post('/events', createEvent);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);
router.get('/events/:id/registrations', listEventRegistrations);

// Dashboard
router.get('/dashboard', getDashboardStats);

// News and Announcements
router.get('/news', listNews);
router.post('/news', createNews);
router.patch('/news/:id/toggle', toggleNewsStatus);
router.delete('/news/:id', deleteNews);

// Announcements
router.get('/announcements', listAnnouncements);
router.post('/announcements', createAnnouncement);
router.patch('/announcements/:id/toggle', toggleAnnouncementStatus);
router.delete('/announcements/:id', deleteAnnouncement);

// Feedback
router.delete('/feedback/:id', deleteFeedback);

module.exports = router;