const pool = require('../config/db');

// GET /api/jobs?location=&type=&search=
// Public: lists open jobs, newest first, with optional filters.
async function listJobs(req, res) {
  const { location, type, search } = req.query;

  let query = `SELECT j.id, j.title, j.company, j.location, j.job_type, j.salary,
                      j.skills, j.description, j.status, j.created_at,
                      u.full_name AS posted_by_name
               FROM jobs j
               LEFT JOIN users u ON u.id = j.posted_by
               WHERE j.status = 'open'`;
  const params = [];

  if (location) {
    params.push(`%${location}%`);
    query += ` AND j.location ILIKE $${params.length}`;
  }
  if (type) {
    params.push(type);
    query += ` AND j.job_type = $${params.length}`;
  }
  if (search) {
    params.push(`%${search}%`);
    query += ` AND (j.title ILIKE $${params.length} OR j.company ILIKE $${params.length})`;
  }

  query += ' ORDER BY j.created_at DESC';

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching jobs' });
  }
}

// GET /api/jobs/:id
async function getJobById(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT j.*, u.full_name AS posted_by_name
       FROM jobs j LEFT JOIN users u ON u.id = j.posted_by
       WHERE j.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching job' });
  }
}

// POST /api/jobs (requires login — alumni or admin)
async function postJob(req, res) {
  const { title, company, location, jobType, salary, skills, description } = req.body;

  if (!title || !company) {
    return res.status(400).json({ message: 'Job title and company are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO jobs (posted_by, title, company, location, job_type, salary, skills, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.user.id, title, company, location, jobType, salary, skills, description]
    );

    res.status(201).json({ message: 'Job posted successfully', job: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while posting job' });
  }
}

// Shared helper: only the job's poster or an admin may modify/close/delete it
async function canModifyJob(req, jobId) {
  const result = await pool.query('SELECT posted_by FROM jobs WHERE id = $1', [jobId]);
  if (result.rows.length === 0) return { found: false };
  const isOwner = Number(result.rows[0].posted_by) === Number(req.user.id);
  const isAdmin = req.user.role === 'admin';
  return { found: true, allowed: isOwner || isAdmin };
}

// PUT /api/jobs/:id
async function updateJob(req, res) {
  const { id } = req.params;
  const { title, company, location, jobType, salary, skills, description } = req.body;

  try {
    const check = await canModifyJob(req, id);
    if (!check.found) return res.status(404).json({ message: 'Job not found' });
    if (!check.allowed) return res.status(403).json({ message: 'You can only edit jobs you posted' });

    const result = await pool.query(
      `UPDATE jobs SET
         title = COALESCE($1, title),
         company = COALESCE($2, company),
         location = COALESCE($3, location),
         job_type = COALESCE($4, job_type),
         salary = COALESCE($5, salary),
         skills = COALESCE($6, skills),
         description = COALESCE($7, description)
       WHERE id = $8 RETURNING *`,
      [title, company, location, jobType, salary, skills, description, id]
    );

    res.json({ message: 'Job updated', job: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while updating job' });
  }
}

// PUT /api/jobs/:id/close
async function closeJob(req, res) {
  const { id } = req.params;

  try {
    const check = await canModifyJob(req, id);
    if (!check.found) return res.status(404).json({ message: 'Job not found' });
    if (!check.allowed) return res.status(403).json({ message: 'You can only close jobs you posted' });

    const result = await pool.query(
      `UPDATE jobs SET status = 'closed' WHERE id = $1 RETURNING *`,
      [id]
    );

    res.json({ message: 'Job closed', job: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while closing job' });
  }
}

// DELETE /api/jobs/:id
async function deleteJob(req, res) {
  const { id } = req.params;

  try {
    const check = await canModifyJob(req, id);
    if (!check.found) return res.status(404).json({ message: 'Job not found' });
    if (!check.allowed) return res.status(403).json({ message: 'You can only delete jobs you posted' });

    await pool.query('DELETE FROM jobs WHERE id = $1', [id]);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting job' });
  }
}

// POST /api/jobs/:id/apply (public — matches jobs.html's application form fields)
async function applyToJob(req, res) {
  const { id } = req.params;
  const { fullName, email, phone, coverLetter, resumeUrl } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ message: 'Full name and email are required' });
  }

  try {
    const job = await pool.query('SELECT id, status FROM jobs WHERE id = $1', [id]);
    if (job.rows.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (job.rows[0].status !== 'open') {
      return res.status(400).json({ message: 'This job is no longer accepting applications' });
    }

    // req.user is only present if a valid token was sent; applying works either way
    const applicantId = req.user ? req.user.id : null;

    const result = await pool.query(
      `INSERT INTO job_applications (job_id, applicant_id, full_name, email, phone, cover_letter, resume_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [id, applicantId, fullName, email, phone, coverLetter, resumeUrl]
    );

    res.status(201).json({ message: 'Application submitted successfully', applicationId: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while submitting application' });
  }
}

// GET /api/jobs/:id/applications (job poster or admin only)
async function listApplications(req, res) {
  const { id } = req.params;

  try {
    const check = await canModifyJob(req, id);
    if (!check.found) return res.status(404).json({ message: 'Job not found' });
    if (!check.allowed) return res.status(403).json({ message: 'You can only view applications for jobs you posted' });

    const result = await pool.query(
      'SELECT * FROM job_applications WHERE job_id = $1 ORDER BY applied_at DESC',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching applications' });
  }
}

module.exports = {
  listJobs,
  getJobById,
  postJob,
  updateJob,
  closeJob,
  deleteJob,
  applyToJob,
  listApplications,
};
