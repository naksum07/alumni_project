const pool = require('../config/db');

async function searchStudents(req, res) {
  const { department, year, search } = req.query;

  let query = `SELECT id, full_name, department, graduation_year, job_title, company
               FROM users WHERE role = 'student' AND is_approved = TRUE AND status = 'active'`;
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

  query += ` ORDER BY full_name ASC`;

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while searching students' });
  }
}

async function getStudentProfile(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, full_name, email, phone, role, department, graduation_year,
              job_title, company, show_phone_publicly
       FROM users WHERE id = $1 AND role = 'student'`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const student = result.rows[0];
    const isLoggedIn = Boolean(req.user);
    const isOwner = req.user && Number(req.user.id) === Number(id);

    if (!isOwner && student.show_phone_publicly !== true) {
      delete student.phone;
    }

    if (!isLoggedIn) {
      delete student.email;
    }

    res.json({
      user: student,
      contactLocked: !isLoggedIn
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching student profile' });
  }
}

module.exports = { searchStudents, getStudentProfile };
