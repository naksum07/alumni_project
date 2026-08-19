const pool = require('../config/db');

// GET /api/admin/users
async function listUsers(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, role, department, graduation_year, created_at
       FROM users ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
}

// DELETE /api/admin/users/:id
async function deleteUser(req, res) {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
}

// GET /api/admin/events
async function listEvents(req, res) {
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY event_date');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching events' });
  }
}

// GET /api/admin/events/:id/registrations
async function listRegistrations(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM event_registrations WHERE event_id = $1 ORDER BY registered_at DESC',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching registrations' });
  }
}

module.exports = { listUsers, deleteUser, listEvents, listRegistrations };