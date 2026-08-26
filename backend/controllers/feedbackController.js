const pool = require('../config/db');

// GET /api/feedback — returns all feedback, newest first
async function getFeedback(req, res) {
  try {
    const result = await pool.query(
      `SELECT f.id, f.rating, f.message, f.created_at,
              u.full_name AS author_name
       FROM feedback f
       LEFT JOIN users u ON u.id = f.user_id
       ORDER BY f.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/feedback — submit new feedback (auth optional)
async function submitFeedback(req, res) {
  const { rating, message } = req.body;
  if (!rating || !message) {
    return res.status(400).json({ message: 'Rating and message are required' });
  }
  try {
    await pool.query(
      'INSERT INTO feedback (user_id, rating, message) VALUES ($1, $2, $3)',
      [req.user?.id || null, rating, message]
    );
    res.status(201).json({ message: 'Thank you for your feedback!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getFeedback, submitFeedback };