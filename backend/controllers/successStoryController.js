const pool = require('../config/db');

// POST /api/success-stories — Create a new success story for logged in alumni
async function createSuccessStory(req, res) {
  const { title, story_text } = req.body;
  const alumniId = req.user?.id;

  if (!title || !title.trim() || !story_text || !story_text.trim()) {
    return res.status(400).json({ message: 'Title and story text are required' });
  }

  try {
    // Check if alumni already has a story
    const existing = await pool.query(
      'SELECT id FROM success_stories WHERE alumni_id = $1',
      [alumniId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: 'You have already submitted a success story. Please edit your existing story instead.'
      });
    }

    const result = await pool.query(
      `INSERT INTO success_stories (alumni_id, title, story_text, status, created_at, updated_at)
       VALUES ($1, $2, $3, 'pending', NOW(), NOW())
       RETURNING *`,
      [alumniId, title.trim(), story_text.trim()]
    );

    res.status(201).json({
      message: 'Success story submitted for approval',
      story: result.rows[0]
    });
  } catch (err) {
    console.error('Error creating success story:', err);
    res.status(500).json({ message: 'Server error while creating success story' });
  }
}

// GET /api/success-stories/my-story — Get logged in alumni's own success story
async function getMySuccessStory(req, res) {
  const alumniId = req.user?.id;

  try {
    const result = await pool.query(
      `SELECT id, alumni_id, title, story_text, status, created_at, updated_at
       FROM success_stories
       WHERE alumni_id = $1`,
      [alumniId]
    );

    res.json({ story: result.rows[0] || null });
  } catch (err) {
    console.error('Error fetching my success story:', err);
    res.status(500).json({ message: 'Server error while fetching success story' });
  }
}

// PUT /api/success-stories/:id — Edit logged in alumni's own success story
async function updateSuccessStory(req, res) {
  const { id } = req.params;
  const { title, story_text } = req.body;
  const alumniId = req.user?.id;

  if (!title || !title.trim() || !story_text || !story_text.trim()) {
    return res.status(400).json({ message: 'Title and story text are required' });
  }

  try {
    // Verify ownership
    const checkOwner = await pool.query(
      'SELECT id, alumni_id FROM success_stories WHERE id = $1',
      [id]
    );

    if (checkOwner.rows.length === 0) {
      return res.status(404).json({ message: 'Success story not found' });
    }

    if (Number(checkOwner.rows[0].alumni_id) !== Number(alumniId)) {
      return res.status(403).json({ message: 'Forbidden: You can only edit your own success story' });
    }

    // Reset status to 'pending' on edit for re-approval
    const result = await pool.query(
      `UPDATE success_stories
       SET title = $1, story_text = $2, status = 'pending', updated_at = NOW()
       WHERE id = $3 AND alumni_id = $4
       RETURNING *`,
      [title.trim(), story_text.trim(), id, alumniId]
    );

    res.json({
      message: 'Success story updated and submitted for re-approval',
      story: result.rows[0]
    });
  } catch (err) {
    console.error('Error updating success story:', err);
    res.status(500).json({ message: 'Server error while updating success story' });
  }
}

// DELETE /api/success-stories/:id — Delete logged in alumni's own success story
async function deleteSuccessStory(req, res) {
  const { id } = req.params;
  const alumniId = req.user?.id;

  try {
    // Verify ownership
    const checkOwner = await pool.query(
      'SELECT id, alumni_id FROM success_stories WHERE id = $1',
      [id]
    );

    if (checkOwner.rows.length === 0) {
      return res.status(404).json({ message: 'Success story not found' });
    }

    if (Number(checkOwner.rows[0].alumni_id) !== Number(alumniId)) {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own success story' });
    }

    await pool.query(
      'DELETE FROM success_stories WHERE id = $1 AND alumni_id = $2',
      [id, alumniId]
    );

    res.json({ message: 'Success story deleted successfully' });
  } catch (err) {
    console.error('Error deleting success story:', err);
    res.status(500).json({ message: 'Server error while deleting success story' });
  }
}

// GET /api/success-stories/public — Public endpoint for approved stories on homepage carousel
async function getApprovedSuccessStories(req, res) {
  try {
    const result = await pool.query(
      `SELECT s.id, s.title, s.story_text, s.status, s.created_at, s.updated_at,
              u.id AS author_id, u.full_name AS author_name, u.department, u.graduation_year,
              u.job_title, u.company, u.profile_picture, u.show_picture_publicly
       FROM success_stories s
       JOIN users u ON u.id = s.alumni_id
       WHERE s.status = 'approved' AND u.status = 'active'
       ORDER BY s.updated_at DESC, s.created_at DESC`
    );

    const stories = result.rows.map(story => ({
      id: story.id,
      title: story.title,
      story_text: story.story_text,
      created_at: story.created_at,
      updated_at: story.updated_at,
      author: {
        id: story.author_id,
        name: story.author_name,
        department: story.department || '',
        graduation_year: story.graduation_year || '',
        job_title: story.job_title || '',
        company: story.company || '',
        profile_picture: story.show_picture_publicly === true ? story.profile_picture : null
      }
    }));

    res.json(stories);
  } catch (err) {
    console.error('Error fetching public success stories:', err);
    res.status(500).json({ message: 'Server error while fetching success stories' });
  }
}

module.exports = {
  createSuccessStory,
  getMySuccessStory,
  updateSuccessStory,
  deleteSuccessStory,
  getApprovedSuccessStories
};
