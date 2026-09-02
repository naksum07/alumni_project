const pool = require('../config/db');

// GET /api/events
async function listEvents(req, res) {
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY event_date');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching events' });
  }
}

// POST /api/events/:id/register
async function registerForEvent(req, res) {
  const { id } = req.params;
  const { fullName, email, phone, message } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ message: 'Full name and email are required' });
  }

  try {
    const existing = await pool.query(
      'SELECT id FROM event_registrations WHERE event_id = $1 AND email = $2',
      [id, email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'You have already registered for this event' });
    }

    const result = await pool.query(
      `INSERT INTO event_registrations (event_id, full_name, email, phone, message)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [id, fullName, email, phone, message]
    );
    res.status(201).json({ message: 'Registered successfully', registrationId: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while registering for event' });
  }
}

module.exports = { listEvents, registerForEvent };
