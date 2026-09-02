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

// GET /api/admin/events
async function listEventsAdmin(req, res) {
  try {
    const result = await pool.query(`
      SELECT e.id, e.name, e.name AS title, COALESCE(e.host, 'Admin') AS host,
             e.event_date AS date, e.event_date, e.event_time, e.venue, e.description,
             COALESCE(e.status, 'upcoming') AS status,
             COUNT(er.id)::int AS "participantCount"
      FROM events e
      LEFT JOIN event_registrations er ON e.id = er.event_id
      GROUP BY e.id
      ORDER BY e.event_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching admin events' });
  }
}

// POST /api/admin/events
async function createEvent(req, res) {
  const name = req.body.name || req.body.title;
  const eventDate = req.body.eventDate || req.body.date;
  const { eventTime, venue, description, host, status } = req.body;

  if (!name || !eventDate) {
    return res.status(400).json({ message: 'Event title/name and date are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO events (name, event_date, event_time, venue, description, host, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, eventDate, eventTime || null, venue || null, description || null, host || 'Admin', status || 'upcoming']
    );

    const event = result.rows[0];
    res.status(201).json({
      message: 'Event created',
      event: {
        ...event,
        title: event.name,
        date: event.event_date,
        participantCount: 0
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while creating event' });
  }
}

// PUT /api/admin/events/:id
async function updateEvent(req, res) {
  const { id } = req.params;
  const name = req.body.name || req.body.title;
  const eventDate = req.body.eventDate || req.body.date;
  const { eventTime, venue, description, host, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE events SET
         name = COALESCE($1, name),
         event_date = COALESCE($2, event_date),
         event_time = COALESCE($3, event_time),
         venue = COALESCE($4, venue),
         description = COALESCE($5, description),
         host = COALESCE($6, host),
         status = COALESCE($7, status)
       WHERE id = $8 RETURNING *`,
      [name || null, eventDate || null, eventTime || null, venue || null, description || null, host || null, status || null, id]
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


// GET /api/admin/dashboard
async function getDashboardStats(req, res) {
  try {
    const userStats = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'alumni' THEN 1 END) as total_alumni,
        COUNT(CASE WHEN role = 'student' THEN 1 END) as total_students
      FROM users
    `);

    const eventStats = await pool.query(`
      SELECT COUNT(*) as total_events FROM events
    `);

    const participantStats = await pool.query(`
      SELECT COUNT(*) as total_participants FROM event_registrations
    `);

    const eventsWithParticipants = await pool.query(`
      SELECT e.id, e.name as title, e.host, e.event_date as date, e.status, COUNT(er.id) as participant_count
      FROM events e
      LEFT JOIN event_registrations er ON e.id = er.event_id
      GROUP BY e.id, e.name, e.host, e.event_date, e.status
      ORDER BY e.event_date DESC
      LIMIT 10
    `);

    res.json({
      userStats: {
        total: parseInt(userStats.rows[0].total_users),
        alumni: parseInt(userStats.rows[0].total_alumni),
        students: parseInt(userStats.rows[0].total_students)
      },
      eventStats: {
        totalEvents: parseInt(eventStats.rows[0].total_events),
        totalParticipants: parseInt(participantStats.rows[0].total_participants)
      },
      events: eventsWithParticipants.rows.map(e => ({
        id: e.id,
        title: e.title,
        host: e.host || 'Admin',
        date: new Date(e.date).toLocaleDateString(),
        status: e.status || 'upcoming',
        participantCount: parseInt(e.participant_count)
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching dashboard stats' });
  }
}

// GET /api/admin/news
async function listNews(req, res) {
  try {
    const result = await pool.query('SELECT * FROM news ORDER BY publish_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching news' });
  }
}

// POST /api/admin/news
async function createNews(req, res) {
  const { title, content, category, audience, status } = req.body;
  if (!title || !content) return res.status(400).json({ message: 'Title and content are required' });

  try {
    const result = await pool.query(
      `INSERT INTO news (title, content, category, visibility, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, content, category || 'News', audience || 'Everyone', status || 'Draft']
    );
    res.status(201).json({ message: 'News created', news: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while creating news' });
  }
}

// PATCH /api/admin/news/:id/toggle
async function toggleNewsStatus(req, res) {
  const { id } = req.params;
  try {
    const news = await pool.query('SELECT status FROM news WHERE id = $1', [id]);
    if (news.rows.length === 0) return res.status(404).json({ message: 'News not found' });
    
    const newStatus = news.rows[0].status === 'Published' ? 'Draft' : 'Published';
    const result = await pool.query(
      'UPDATE news SET status = $1 WHERE id = $2 RETURNING *',
      [newStatus, id]
    );
    res.json({ message: 'News status toggled', news: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while toggling news status' });
  }
}

// DELETE /api/admin/news/:id
async function deleteNews(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM news WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'News not found' });
    res.json({ message: 'News deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting news' });
  }
}

module.exports = {
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
  deleteNews
};
