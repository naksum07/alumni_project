const pool = require('../config/db');

// GET /api/news — Public: fetch published news articles
async function getPublicNews(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, title, content, category, image_url, publish_date, visibility, created_at
       FROM news
       WHERE status = 'Published'
       ORDER BY publish_date DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching public news:', err);
    res.status(500).json({ message: 'Server error while fetching news' });
  }
}

module.exports = { getPublicNews };
