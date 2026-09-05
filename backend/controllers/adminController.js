const pool = require('../config/db');
const sendEmail = require('../services/emailService');


// GET /api/admin/users?status=pending
// Lists all users. Optional ?status= filters by status (active/suspended/etc),
// or pass ?approved=false to see accounts awaiting approval.
async function listUsers(req, res) {
  const { status, approved, sort, search } = req.query;

  let query = `SELECT id, full_name, email, phone, role, department, graduation_year,
                      job_title, company, is_approved, status, created_at
               FROM users WHERE role != 'admin'`;
  const params = [];

  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }
  if (approved !== undefined) {
    params.push(approved === 'true');
    query += ` AND is_approved = $${params.length}`;
  }
  if (search) {
    params.push(`%${search}%`);
    query += ` AND (full_name ILIKE $${params.length} OR email ILIKE $${params.length})`;
  }

  if (sort === 'alpha') {
    query += ' ORDER BY full_name ASC';
  } else {
    query += ' ORDER BY created_at DESC';
  }

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
      `UPDATE users SET is_approved = TRUE, status = 'active' WHERE id = $1
       RETURNING id, full_name, email, is_approved, status`,
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
  const { date_from, date_to, status, search } = req.query;
  
  let query = `
      SELECT e.id, e.name, e.name AS title, COALESCE(e.host, 'Admin') AS host,
             e.event_date AS date, e.event_date, e.event_date_end, e.event_time, e.venue, e.description,
             COALESCE(e.status, 'upcoming') AS status,
             COUNT(er.id)::int AS "participantCount"
      FROM events e
      LEFT JOIN event_registrations er ON e.id = er.event_id
      WHERE 1=1
  `;
  const params = [];

  if (date_from) {
    params.push(date_from);
    query += ` AND e.event_date >= $${params.length}`;
  }
  if (date_to) {
    params.push(date_to);
    query += ` AND e.event_date <= $${params.length}`;
  }
  if (status) {
    params.push(status);
    query += ` AND COALESCE(e.status, 'upcoming') = $${params.length}`;
  }
  if (search) {
    params.push(`%${search}%`);
    query += ` AND (e.name ILIKE $${params.length} OR e.description ILIKE $${params.length})`;
  }

  query += `
      GROUP BY e.id
      ORDER BY e.event_date DESC
  `;

  try {
    const result = await pool.query(query, params);
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
  const eventDateEnd = req.body.eventDateEnd;
  const { eventTime, venue, description, host, status } = req.body;

  if (!name || !eventDate) {
    return res.status(400).json({ message: 'Event title/name and start date are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO events (name, event_date, event_date_end, event_time, venue, description, host, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, eventDate, eventDateEnd || null, eventTime || null, venue || null, description || null, host || 'Admin', status || 'upcoming']
    );

    const event = result.rows[0];

    // Broadcast email notification to active users asynchronously
    (async () => {
      try {
        const usersResult = await pool.query("SELECT email, full_name FROM users WHERE is_approved = TRUE AND role != 'admin'");
        const frontendUrl = process.env.FRONTEND_URL || `http://localhost:${process.env.PORT || 5001}`;
        const eventsPageUrl = `${frontendUrl}/events.html`;
        const formattedDate = event.event_date ? new Date(event.event_date).toLocaleDateString('en-US', { dateStyle: 'full' }) : 'TBD';
        const eventTimeStr = event.event_time ? ` at ${event.event_time}` : '';

        for (const user of usersResult.rows) {
          if (!user.email) continue;
          await sendEmail(
            user.email,
            `🎉 New Event Announcement: ${event.name}`,
            `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
              <h2 style="color: #012970; margin-top: 0;">New Event Announcement 🎉</h2>
              <p style="color: #334155; font-size: 15px;">Hello <strong>${user.full_name || 'Member'}</strong>,</p>
              <p style="color: #334155; font-size: 15px;">A new event has been posted on the Alumni Portal!</p>
              
              <div style="background-color: #f8fafc; border-left: 4px solid #c4161c; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <h3 style="margin: 0 0 10px 0; color: #012970;">${event.name}</h3>
                <p style="margin: 5px 0; font-size: 14px; color: #475569;"><strong>🗓️ Date:</strong> ${formattedDate}${eventTimeStr}</p>
                <p style="margin: 5px 0; font-size: 14px; color: #475569;"><strong>📍 Venue:</strong> ${event.venue || 'To be announced'}</p>
                ${event.description ? `<p style="margin: 10px 0 0 0; font-size: 14px; color: #334155;">${event.description}</p>` : ''}
              </div>

              <div style="margin: 25px 0;">
                <a href="${eventsPageUrl}" style="background-color: #c4161c; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View & Register on Portal</a>
              </div>
            </div>`
          );
        }
      } catch (broadcastErr) {
        console.error('Failed to send event broadcast emails:', broadcastErr.message || broadcastErr);
      }
    })();

    res.status(201).json({
      message: 'Event created and notification sent',
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
  const eventDateEnd = req.body.eventDateEnd;
  const { eventTime, venue, description, host, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE events SET
         name = COALESCE($1, name),
         event_date = COALESCE($2, event_date),
         event_date_end = COALESCE($3, event_date_end),
         event_time = COALESCE($4, event_time),
         venue = COALESCE($5, venue),
         description = COALESCE($6, description),
         host = COALESCE($7, host),
         status = COALESCE($8, status)
       WHERE id = $9 RETURNING *`,
      [name || null, eventDate || null, eventDateEnd || null, eventTime || null, venue || null, description || null, host || null, status || null, id]
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
    const userStatsPromise = pool.query(`
      SELECT 
        COUNT(CASE WHEN role != 'admin' THEN 1 END) as total_users,
        COUNT(CASE WHEN role = 'alumni' THEN 1 END) as total_alumni,
        COUNT(CASE WHEN role = 'student' THEN 1 END) as total_students
      FROM users
    `);

    const eventStatsPromise = pool.query(`
      SELECT COUNT(*) as total_events FROM events
    `);

    const participantStatsPromise = pool.query(`
      SELECT COUNT(*) as total_participants FROM event_registrations
    `);

    const eventsWithParticipantsPromise = pool.query(`
      SELECT e.id, e.name as title, e.host, e.event_date as date, e.status, COUNT(er.id) as participant_count
      FROM events e
      LEFT JOIN event_registrations er ON e.id = er.event_id
      GROUP BY e.id, e.name, e.host, e.event_date, e.status
      ORDER BY e.event_date DESC
      LIMIT 10
    `);

    const [userStats, eventStats, participantStats, eventsWithParticipants] = await Promise.all([
      userStatsPromise,
      eventStatsPromise,
      participantStatsPromise,
      eventsWithParticipantsPromise
    ]);

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
  const { date_from, date_to, status, search } = req.query;
  
  let query = 'SELECT * FROM news WHERE 1=1';
  const params = [];

  if (date_from) {
    params.push(date_from);
    query += ` AND publish_date::date >= $${params.length}`;
  }
  if (date_to) {
    params.push(date_to);
    query += ` AND publish_date::date <= $${params.length}`;
  }
  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }
  if (search) {
    params.push(`%${search}%`);
    query += ` AND (title ILIKE $${params.length} OR content ILIKE $${params.length})`;
  }

  query += ' ORDER BY publish_date DESC';

  try {
    const result = await pool.query(query, params);
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
      `INSERT INTO news (title, content, category, visibility, status, posted_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, content, category || 'News', audience || 'Everyone', status || 'Draft', req.user?.id || null]
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

// DELETE /api/admin/feedback/:id
async function deleteFeedback(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM feedback WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Feedback not found' });
    res.json({ message: 'Feedback deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting feedback' });
  }
}

// GET /api/admin/announcements
async function listAnnouncements(req, res) {
  const { status, search } = req.query;

  let query = 'SELECT * FROM announcements WHERE 1=1';
  const params = [];

  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }
  if (search) {
    params.push(`%${search}%`);
    query += ` AND (title ILIKE $${params.length} OR content ILIKE $${params.length})`;
  }

  query += ' ORDER BY created_at DESC';

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching announcements' });
  }
}

// POST /api/admin/announcements
async function createAnnouncement(req, res) {
  const { title, content, priority, status } = req.body;
  if (!title || !content) return res.status(400).json({ message: 'Title and content are required' });

  try {
    const result = await pool.query(
      `INSERT INTO announcements (title, content, priority, status, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, content, priority || 'normal', status || 'Published', req.user?.id || null]
    );
    res.status(201).json({ message: 'Announcement created', announcement: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while creating announcement' });
  }
}

// PATCH /api/admin/announcements/:id/toggle
async function toggleAnnouncementStatus(req, res) {
  const { id } = req.params;
  try {
    const ann = await pool.query('SELECT status FROM announcements WHERE id = $1', [id]);
    if (ann.rows.length === 0) return res.status(404).json({ message: 'Announcement not found' });

    const newStatus = ann.rows[0].status === 'Published' ? 'Draft' : 'Published';
    const result = await pool.query(
      'UPDATE announcements SET status = $1 WHERE id = $2 RETURNING *',
      [newStatus, id]
    );
    res.json({ message: 'Announcement status toggled', announcement: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while toggling announcement status' });
  }
}

// DELETE /api/admin/announcements/:id
async function deleteAnnouncement(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM announcements WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Announcement not found' });
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting announcement' });
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
  deleteNews,
  deleteFeedback,
  listAnnouncements,
  createAnnouncement,
  toggleAnnouncementStatus,
  deleteAnnouncement
};
