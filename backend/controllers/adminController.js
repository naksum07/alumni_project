const pool = require('../config/db');

// GET /api/admin/users?status=pending
// Lists all users. Optional ?status= filters by status (active/suspended/etc),
// or pass ?approved=false to see accounts awaiting approval.
async function listUsers(req, res) {
  const { status, approved } = req.query;

  let query = `SELECT id, full_name, email, phone, role, department, graduation_year,
                      job_title, company, is_approved, status, created_at
               FROM users WHERE 1=1`;
  const params = [];

  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }
  if (approved !== undefined) {
    params.push(approved === 'true');
    query += ` AND is_approved = $${params.length}`;
  }

  query += ' ORDER BY created_at DESC';

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
}

// PUT /api/admin/users/:id/approve
async function approveUser(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE users SET is_approved = TRUE WHERE id = $1
       RETURNING id, full_name, email, is_approved`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User approved', user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while approving user' });
  }
}

// PUT /api/admin/users/:id/reject
async function rejectUser(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE users SET is_approved = FALSE, status = 'rejected' WHERE id = $1
       RETURNING id, full_name, email, is_approved, status`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User rejected', user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while rejecting user' });
  }
}

// PUT /api/admin/users/:id/status
// body: { status: 'active' | 'suspended' | 'banned' }
async function updateUserStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = ['active', 'suspended', 'banned'];
  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${allowedStatuses.join(', ')}` });
  }

  try {
    const result = await pool.query(
      `UPDATE users SET status = $1 WHERE id = $2
       RETURNING id, full_name, email, status`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `User status updated to ${status}`, user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while updating user status' });
  }
}

// DELETE /api/admin/users/:id
async function deleteUser(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
}

// POST /api/admin/events
async function createEvent(req, res) {
  const { name, eventDate, eventTime, venue, description } = req.body;

  if (!name || !eventDate) {
    return res.status(400).json({ message: 'Event name and date are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO events (name, event_date, event_time, venue, description)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, eventDate, eventTime, venue, description]
    );

    res.status(201).json({ message: 'Event created', event: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while creating event' });
  }
}

// PUT /api/admin/events/:id
async function updateEvent(req, res) {
  const { id } = req.params;
  const { name, eventDate, eventTime, venue, description } = req.body;

  try {
    const result = await pool.query(
      `UPDATE events SET
         name = COALESCE($1, name),
         event_date = COALESCE($2, event_date),
         event_time = COALESCE($3, event_time),
         venue = COALESCE($4, venue),
         description = COALESCE($5, description)
       WHERE id = $6 RETURNING *`,
      [name, eventDate, eventTime, venue, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event updated', event: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while updating event' });
  }
}

// DELETE /api/admin/events/:id
async function deleteEvent(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting event' });
  }
}

// GET /api/admin/events/:id/registrations
async function listEventRegistrations(req, res) {
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

module.exports = {
  listUsers,
  approveUser,
  rejectUser,
  updateUserStatus,
  deleteUser,
  createEvent,
  updateEvent,
  deleteEvent,
  listEventRegistrations,
};
