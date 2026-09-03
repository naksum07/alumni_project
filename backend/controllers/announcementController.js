const pool = require('../config/db');

// GET /api/announcements — Public: fetch published announcements for homepage carousel
async function getPublicAnnouncements(req, res) {
  try {
    const annResult = await pool.query(
      `SELECT id, title, content, priority, created_at
       FROM announcements
       WHERE status = 'Published'
       ORDER BY created_at DESC`
    );

    const newsAnnResult = await pool.query(
      `SELECT id, title, content, 'normal' as priority, created_at
       FROM news
       WHERE status = 'Published' AND category ILIKE '%announcement%'
       ORDER BY created_at DESC`
    );

    const combined = [...annResult.rows, ...newsAnnResult.rows];
    combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(combined);
  } catch (err) {
    console.error('Error fetching public announcements:', err);
    res.status(500).json({ message: 'Server error while fetching announcements' });
  }
}

module.exports = { getPublicAnnouncements };
