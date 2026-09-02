const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');

// Roles a person is allowed to self-select at registration.
// 'admin' is intentionally excluded so nobody can grant themselves
// admin access by sending role: 'admin' in the request body.
const SELF_REGISTERABLE_ROLES = ['student', 'alumni'];

// POST /api/auth/register
async function register(req, res) {
  let { fullName, firstName, middleName, lastName, email, phone, password, role, department, graduationYear, expectedGraduationYear } = req.body;

  if (!fullName && (firstName || lastName)) {
    fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
  }

  const finalGradYear = graduationYear || expectedGraduationYear || req.body['expected-grad-year'] || null;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'Full name, email, and password are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }

  const safeRole = SELF_REGISTERABLE_ROLES.includes(role) ? role : 'student';

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role, department, graduation_year)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, full_name, email, role`,
      [fullName, email, phone, passwordHash, safeRole, department, finalGradYear]
    );

    res.status(201).json({ message: 'Registration successful', user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Enforce account state — pending/rejected/suspended/banned accounts cannot log in.
    if (!user.is_approved) {
      return res.status(403).json({ message: 'Your account is pending admin approval' });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ message: 'Your account registration was rejected' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended. Contact an administrator.' });
    }
    if (user.status === 'banned') {
      return res.status(403).json({ message: 'Your account has been banned' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role
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

  try {
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
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

    // ⚠️ devToken is only included in development so you can test the
    // reset flow without a real email service. In production this field
    // is NEVER sent — the token should arrive by email only.
    const responsePayload = { message: 'If that email exists, a reset link has been sent.' };
    if (process.env.NODE_ENV !== 'production') {
      responsePayload.devResetUrl = `/reset-password.html?token=${token}`;
    }
    res.json(responsePayload);
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
  if (!username || !passcode) {
    return res.status(400).json({ message: 'Username and passcode are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND role = \'admin\'', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const passwordMatches = await bcrypt.compare(passcode, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
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
