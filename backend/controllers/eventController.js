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
  const { fullName, email, phone, message, attendeeType, designationOrOrg } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ success: false, message: 'Full name and email are required' });
  }

  try {
    // Confirm the event exists before registering
    const eventCheck = await pool.query('SELECT id FROM events WHERE id = $1', [id]);
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const existing = await pool.query(
      'SELECT id FROM event_registrations WHERE event_id = $1 AND email = $2',
      [id, email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'You have already registered for this event' });
    }

    const result = await pool.query(
      `INSERT INTO event_registrations (event_id, full_name, email, phone, attendee_type, designation_or_org, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [id, fullName, email, phone || null, attendeeType || 'Student', designationOrOrg || null, message || null]
    );
    res.status(201).json({ success: true, message: 'Registered successfully', registrationId: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error while registering for event' });
  }
}

module.exports = { listEvents, registerForEvent };
