const express = require('express');
const router = express.Router();
const {
  listUsers,
  deleteUser,
  listEvents,
  listRegistrations,
} = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.use(verifyToken, verifyAdmin);

router.get('/users', listUsers);
router.delete('/users/:id', deleteUser);
router.get('/events', listEvents);
router.get('/events/:id/registrations', listRegistrations);

module.exports = router;