const pool = require('../config/db');

// GET /api/alumni?department=CSE&year=2022&search=priya
async function searchAlumni(req, res) {
  const { department, year, search } = req.query;

  let query = `SELECT id, full_name, department, graduation_year, current_role, company
               FROM users WHERE role = 'alumni'`;
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
    query += ` AND full_name ILIKE $${params.length}`;
  }

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while searching alumni' });
  }
}

// GET /api/alumni/:id
async function getAlumniProfile(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, full_name, email, department, graduation_year, current_role, company
       FROM users WHERE id = $1 AND role = 'alumni'`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Alumni not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
}

module.exports = { searchAlumni, getAlumniProfile };