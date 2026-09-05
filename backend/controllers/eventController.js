const pool = require('../config/db');
const sendEmail = require('../services/emailService');

// GET /api/events?page=&limit=
async function listEvents(req, res) {
  const { page, limit } = req.query;
  try {
    let query = 'SELECT * FROM events ORDER BY event_date DESC';
    const params = [];

    if (page || limit) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, parseInt(limit, 10) || 21);
      const offset = (pageNum - 1) * limitNum;
      query = 'SELECT * FROM events ORDER BY event_date DESC LIMIT $1 OFFSET $2';
      params.push(limitNum, offset);
    }

    const result = await pool.query(query, params);
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
    const eventCheck = await pool.query('SELECT id, name, event_date, event_time, venue FROM events WHERE id = $1', [id]);
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    const event = eventCheck.rows[0];

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

    // Send confirmation email to attendee
    try {
      const formattedDate = event.event_date ? new Date(event.event_date).toLocaleDateString('en-US', { dateStyle: 'full' }) : 'TBD';
      const eventTimeStr = event.event_time ? ` at ${event.event_time}` : '';
      await sendEmail(
        email,
        `Event Registration Confirmed: ${event.name}`,
        `<div style="font-family: sans-serif; padding: 20px;">
          <h2>Upcoming Event: ${event.name} 🎉</h2>
          <p>Hello <strong>${fullName}</strong>,</p>
          <p>Your registration for <strong>${event.name}</strong> is confirmed.</p>
          <p><strong>Date:</strong> ${formattedDate}${eventTimeStr}</p>
          <p><strong>Location:</strong> ${event.venue || 'To be announced'}</p>
          <p>Thank you for registering! We look forward to seeing you there.</p>
        </div>`
      );
    } catch (emailErr) {
      console.error('Failed to send event confirmation email:', emailErr.response || emailErr.message || emailErr);
    }

    res.status(201).json({ success: true, message: 'Registered successfully', registrationId: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error while registering for event' });
  }
}

module.exports = { listEvents, registerForEvent };

