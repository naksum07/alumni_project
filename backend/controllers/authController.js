const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');
const sendEmail = require('../services/emailService');

// Roles a person is allowed to self-select at registration.
// 'admin' is intentionally excluded so nobody can grant themselves
// admin access by sending role: 'admin' in the request body.
const SELF_REGISTERABLE_ROLES = ['student', 'alumni'];

// POST /api/auth/register
async function register(req, res) {
  let { fullName, firstName, middleName, lastName, email, phone, password, role, department, graduationYear, expectedGraduationYear, gender, company, jobTitle, enrollmentNumber, city, linkedinUrl } = req.body;

  if (!fullName && (firstName || lastName)) {
    fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
  }

  const finalGradYear = graduationYear || expectedGraduationYear || req.body['expected-grad-year'] || null;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'Full name, email, and password are required' });
  }

  const safeRole = SELF_REGISTERABLE_ROLES.includes(role) ? role : 'student';

  if (safeRole === 'student' && !enrollmentNumber) {
    return res.status(400).json({ message: 'Enrollment number is required for student registration' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const defaultJobTitle = safeRole === 'student' ? (jobTitle || 'Student') : (jobTitle || null);
    const defaultCompany = safeRole === 'student' ? (company || 'The ICFAI University, Sikkim') : (company || null);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role, department, graduation_year, gender, company, job_title, enrollment_number, city, linkedin_url, is_approved)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, TRUE)
       RETURNING id, full_name, email, phone, role, department, graduation_year, gender, company, job_title, enrollment_number, city, linkedin_url, bio, profile_picture`,
      [fullName, cleanEmail, phone, passwordHash, safeRole, department, finalGradYear, gender || null, defaultCompany, defaultJobTitle, enrollmentNumber || null, city || null, linkedinUrl || null]
    );

    const u = result.rows[0];
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: u.id,
        fullName: u.full_name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        department: u.department,
        graduationYear: u.graduation_year,
        gender: u.gender,
        company: u.company,
        jobTitle: u.job_title,
        enrollmentNumber: u.enrollment_number,
        city: u.city,
        linkedinUrl: u.linkedin_url,
        bio: u.bio,
        profilePicture: u.profile_picture
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || !email.trim() || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({ message: 'Your account registration was rejected by an administrator.' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended. Contact an administrator.' });
    }
    if (user.status === 'banned') {
      return res.status(403).json({ message: 'Your account has been banned due to terms violation.' });
    }
    if (user.is_approved === false || user.status === 'pending') {
      return res.status(403).json({ message: 'Your account is pending approval by an administrator.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret-key-fallback',
      { expiresIn: '2h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department,
        graduationYear: user.graduation_year,
        gender: user.gender,
        company: user.company,
        jobTitle: user.job_title,
        enrollmentNumber: user.enrollment_number,
        city: user.city,
        linkedinUrl: user.linkedin_url,
        bio: user.bio,
        profilePicture: user.profile_picture
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
}

// POST /api/auth/forgot-password
async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const result = await pool.query('SELECT id, email FROM users WHERE email = $1', [cleanEmail]);
    const user = result.rows[0];

    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await pool.query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );

    const frontendUrl = process.env.FRONTEND_URL || `http://localhost:${process.env.PORT || 5001}`;

    const resetLink = `${frontendUrl}/reset-password.html?token=${token}`;

    try {
      await sendEmail(
        user.email || cleanEmail,
        'Password Reset Request - Alumni Portal',
        `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #012970; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #334155; font-size: 15px;">Hello,</p>
          <p style="color: #334155; font-size: 15px;">You requested a password reset for your Alumni Portal account.</p>
          
          <div style="margin: 25px 0;">
            <a href="${resetLink}" style="background-color: #c4161c; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>

          <p style="color: #64748b; font-size: 14px; margin-top: 25px;">If the button above does not open (due to email tracking), please copy and paste the link below directly into your browser address bar:</p>

          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 13px; color: #0f172a; word-break: break-all; -webkit-user-select: all; user-select: all;">
            ${resetLink}
          </div>

          <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">This link will expire in 15 minutes. If you did not request a password reset, please ignore this email.</p>
        </div>`

      );
    } catch (emailErr) {
      console.error('Failed to send reset email via SMTP:', emailErr.response || emailErr.message || emailErr);
      return res.status(500).json({
        message: emailErr.response || emailErr.message || 'Failed to dispatch email via mail service'
      });
    }

    res.json({ message: 'If that email exists, a reset link has been sent.' });


  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/auth/reset-password
async function resetPassword(req, res) {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM password_resets WHERE token = $1 AND expires_at > NOW()',
      [token]
    );
    const resetRow = result.rows[0];

    if (!resetRow) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
      passwordHash,
      resetRow.user_id,
    ]);

    await pool.query('DELETE FROM password_resets WHERE id = $1', [resetRow.id]);

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}



// POST /api/admin/login (handled in authController but mounted in adminRoutes)
async function adminLogin(req, res) {
  const { username, passcode } = req.body;
  if (!username || typeof username !== 'string' || !username.trim() || !passcode) {
    return res.status(400).json({ message: 'Username and passcode are required' });
  }

  const cleanUsername = username.trim().toLowerCase();

  try {
    // Look up the admin user by email or full name (case-insensitive)
    const result = await pool.query(
      `SELECT * FROM users WHERE (LOWER(email) = $1 OR LOWER(full_name) = $1) AND role = 'admin'`,
      [cleanUsername]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Only allow bcrypt-verified passwords — no hardcoded fallbacks
    const passwordMatches = await bcrypt.compare(passcode, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret-key-fallback',
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Admin login successful',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during admin login' });
  }
}

module.exports = { register, login, forgotPassword, resetPassword, adminLogin };
