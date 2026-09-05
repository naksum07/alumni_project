const pool = require('../config/db');

async function searchAlumni(req, res) {
  const { department, year, search } = req.query;

  let query = `SELECT id, full_name, department, graduation_year, job_title, company, city, linkedin_url, profile_picture, show_picture_publicly
               FROM users WHERE role = 'alumni' AND is_approved = TRUE AND status = 'active'`;
  const params = [];

  if (department) {
    params.push(department);
    query += ` AND department = $${params.length}`;
  }
  if (year) {
    params.push(year);
    query += ` AND graduation_year = $${params.length}`;
  }
  if (search) {
    params.push(`%${search}%`);
    query += ` AND (full_name ILIKE $${params.length} OR job_title ILIKE $${params.length} OR company ILIKE $${params.length} OR department ILIKE $${params.length} OR city ILIKE $${params.length})`;
  }

  query += ` ORDER BY full_name ASC`;

  try {
    const result = await pool.query(query, params);
    const sanitized = result.rows.map(a => ({
      ...a,
      profile_picture: a.show_picture_publicly === true ? a.profile_picture : null
    }));
    res.json(sanitized);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while searching alumni' });
  }
}

async function getAlumniProfile(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, full_name, email, department, graduation_year, job_title, company, city, linkedin_url, bio, profile_picture, show_picture_publicly
       FROM users WHERE id = $1 AND role = 'alumni'`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Alumni not found' });
    }

    const alumni = result.rows[0];
    const isLoggedIn = Boolean(req.user);
    const isOwner = req.user && Number(req.user.id) === Number(id);

    if (!isOwner && alumni.show_picture_publicly !== true) {
      delete alumni.profile_picture;
      alumni.profile_picture = null;
    }

    if (!isLoggedIn) {
      delete alumni.email;
    }

    res.json({ user: alumni, contactLocked: !isLoggedIn });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
}

module.exports = { searchAlumni, getAlumniProfile };