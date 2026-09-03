const pool = require('../config/db');

// GET /api/news — Public: fetch published news articles
async function getPublicNews(req, res) {
  try {
    const result = await pool.query(
      `SELECT n.id, n.title, n.content, n.category, n.image_url, n.publish_date, n.visibility, n.created_at
       FROM news n
       JOIN users u ON u.id = n.posted_by
       WHERE n.status = 'Published' AND u.role = 'admin'
       ORDER BY n.publish_date DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching public news:', err);
    res.status(500).json({ message: 'Server error while fetching news' });
  }
}

module.exports = { getPublicNews };
