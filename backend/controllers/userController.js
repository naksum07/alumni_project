const bcrypt = require('bcryptjs');
const pool = require('../config/db');

function sanitizePublicUser(user, isLoggedIn) {
  if (!user) return null;

  const publicUser = { ...user };

  if (publicUser.show_phone_publicly !== true) {
    delete publicUser.phone;
  }

  if (!isLoggedIn) {
    delete publicUser.email;
  }

  delete publicUser.password_hash;
  delete publicUser.show_phone_publicly;
  return publicUser;
}

async function getUserProfile(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, full_name, email, phone, role, department, graduation_year,
              job_title, company, show_phone_publicly
       FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    const isLoggedIn = Boolean(req.user);
    const isOwner = req.user && Number(req.user.id) === Number(id);

    if (isOwner) {
      return res.json({ user: { ...user, showPhonePublicly: user.show_phone_publicly === true }, contactLocked: false });
    }

    const publicUser = sanitizePublicUser(user, isLoggedIn);
    return res.json({ user: { ...publicUser, showPhonePublicly: user.show_phone_publicly === true }, contactLocked: !isLoggedIn });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return res.status(500).json({ message: 'Server error while fetching user profile' });
  }
}

async function updateUserProfile(req, res) {
  const { id } = req.params;

  if (!req.user || Number(req.user.id) !== Number(id)) {
    return res.status(403).json({ message: 'You can only update your own profile' });
  }

  const { job_title, current_role, company, department, graduation_year, phone, showPhonePublicly, full_name, currentPassword, newPassword } = req.body;

  const allowedUpdates = [];
  const values = [];

  const pushUpdate = (column, value) => {
    allowedUpdates.push(`${column} = $${values.length + 1}`);
    values.push(value);
  };

  if (job_title !== undefined) {
    pushUpdate('job_title', typeof job_title === 'string' ? job_title.trim() || null : job_title);
  }

  if (current_role !== undefined && job_title === undefined) {
    pushUpdate('job_title', typeof current_role === 'string' ? current_role.trim() || null : current_role);
  }

  if (company !== undefined) {
    pushUpdate('company', typeof company === 'string' ? company.trim() || null : company);
  }

  if (department !== undefined) {
    pushUpdate('department', typeof department === 'string' ? department.trim() || null : department);
  }

  if (graduation_year !== undefined) {
    pushUpdate('graduation_year', graduation_year === '' ? null : graduation_year);
  }

  if (phone !== undefined) {
    pushUpdate('phone', typeof phone === 'string' ? phone.trim() || null : phone);
  }

  if (full_name !== undefined) {
    pushUpdate('full_name', typeof full_name === 'string' ? full_name.trim() || null : full_name);
  }

  if (showPhonePublicly !== undefined) {
    pushUpdate('show_phone_publicly', Boolean(showPhonePublicly));
  }

  if (newPassword !== undefined || currentPassword !== undefined) {
    if (!currentPassword) {
      return res.status(400).json({ message: 'Your current password is required to change the password.' });
    }

    if (!newPassword || String(newPassword).length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
    }

    const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [id]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const passwordMatches = await bcrypt.compare(String(currentPassword), user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    const passwordHash = await bcrypt.hash(String(newPassword), 10);
    pushUpdate('password_hash', passwordHash);
  }

  if (allowedUpdates.length === 0) {
    return res.status(400).json({ message: 'No profile fields were provided to update.' });
  }

  values.push(id);

  try {
    await pool.query(`UPDATE users SET ${allowedUpdates.join(', ')} WHERE id = $${values.length}`, values);

    return res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (err) {
    console.error('Error updating user profile:', err);
    return res.status(500).json({ message: 'Server error while updating profile' });
  }
}

async function updateUserSettings(req, res) {
  const { id } = req.params;

  if (!req.user || Number(req.user.id) !== Number(id)) {
    return res.status(403).json({ message: 'You can only update your own settings' });
  }

  const { showPhonePublicly } = req.body;
  const value = Boolean(showPhonePublicly);

  try {
    await pool.query(
      'UPDATE users SET show_phone_publicly = $1 WHERE id = $2',
      [value, id]
    );

    return res.json({
      success: true,
      showPhonePublicly: value,
      message: 'Phone visibility updated successfully'
    });
  } catch (err) {
    console.error('Error updating user settings:', err);
    return res.status(500).json({ message: 'Server error while updating settings' });
  }
}

module.exports = { getUserProfile, updateUserProfile, updateUserSettings };
