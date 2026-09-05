const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

function saveBase64Image(base64Data, subfolder) {
  if (!base64Data || typeof base64Data !== 'string' || !base64Data.startsWith('data:image/')) {
    return base64Data || null;
  }

  try {
    const matches = base64Data.match(/^data:image\/([a-zA-Z0-9+-]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64Data;
    }

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const uploadsDir = path.join(__dirname, '..', 'uploads', subfolder);

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `${subfolder}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, buffer);
    return `/uploads/${subfolder}/${filename}`;
  } catch (err) {
    console.error('Error saving base64 image:', err);
    return null;
  }
}

// GET /api/jobs?location=&type=&search=
// Public: lists open jobs, newest first, with optional filters.
async function listJobs(req, res) {
  const { location, type, search } = req.query;

  let query = `SELECT j.id, j.title, j.company, j.location, j.job_type, j.salary,
                      j.skills, j.description, j.status, j.created_at, j.posted_by,
                      u.full_name AS posted_by_name
               FROM jobs j
               LEFT JOIN users u ON u.id = j.posted_by
               WHERE j.status = 'open' AND (u.status = 'active' OR j.posted_by IS NULL)`;
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

  const role = String(req.user?.role || '').toLowerCase();
  if (!req.user || (role !== 'alumni' && role !== 'admin')) {
    return res.status(403).json({ message: 'Only alumni and administrators can post opportunities.' });
  }

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
  const isAdmin = String(req.user?.role || '').toLowerCase() === 'admin';
  const isOwner = Number(result.rows[0].posted_by) === Number(req.user.id);
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

// POST /api/jobs/:id/apply (requires logged-in student)
async function applyToJob(req, res) {
  const { id } = req.params;
  const { fullName, email, phone, coverLetter, resumeUrl, resumeImage } = req.body;

  if (!req.user || String(req.user.role || '').toLowerCase() !== 'student') {
    return res.status(403).json({ message: 'Only registered, logged-in students can apply for jobs.' });
  }

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

    const applicantId = req.user.id;
    let savedResumePath = saveBase64Image(resumeImage || resumeUrl, 'resumes');
    if (!savedResumePath && (resumeImage || resumeUrl)) {
      savedResumePath = resumeUrl || resumeImage;
    }

    const result = await pool.query(
      `INSERT INTO job_applications (job_id, applicant_id, full_name, email, phone, cover_letter, resume_url, resume_image_path)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [id, applicantId, fullName, email, phone, coverLetter, savedResumePath, savedResumePath]
    );

    res.status(201).json({ message: 'Application submitted successfully', applicationId: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while submitting application' });
  }
}

// GET /api/jobs/:id/applications (job poster only)
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

// GET /api/jobs/my-applications (logged-in user)
async function getMyApplications(req, res) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const result = await pool.query(
      `SELECT DISTINCT job_id FROM job_applications WHERE applicant_id = $1 OR LOWER(email) = LOWER($2)`,
      [req.user.id, req.user.email || '']
    );
    const appliedJobIds = result.rows.map(r => r.job_id);
    res.json({ success: true, appliedJobIds });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error while fetching user applications' });
  }
}

// GET /api/jobs/my-posted-jobs (logged in user)
async function getMyPostedJobs(req, res) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const jobsResult = await pool.query(
      `SELECT id, title, company, location, job_type, salary, status, created_at
       FROM jobs WHERE posted_by = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    const jobs = jobsResult.rows;

    for (let job of jobs) {
      const appsResult = await pool.query(
        `SELECT app.*, u.department, u.graduation_year, u.enrollment_number, u.gender, u.profile_picture
         FROM job_applications app
         LEFT JOIN users u ON u.id = app.applicant_id
         WHERE app.job_id = $1
         ORDER BY app.applied_at DESC`,
        [job.id]
      );
      job.applications = appsResult.rows;
    }

    res.json({ success: true, jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error while fetching posted jobs' });
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
  getMyApplications,
  getMyPostedJobs,
};
