const pool = require('../config/db');

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

module.exports = { submitFeedback };