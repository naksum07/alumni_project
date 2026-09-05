const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
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

function sanitizePublicUser(user, isLoggedIn) {
  if (!user) return null;

  const publicUser = { ...user };

  if (publicUser.show_phone_publicly !== true) {
    delete publicUser.phone;
  }

  if (publicUser.show_picture_publicly !== true) {
    delete publicUser.profile_picture;
    publicUser.profile_picture = null;
  }

  if (!isLoggedIn) {
    delete publicUser.email;
  }

  delete publicUser.password_hash;
  delete publicUser.show_phone_publicly;
  delete publicUser.show_picture_publicly;
  return publicUser;
}

async function getUserProfile(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, full_name, email, phone, role, department, graduation_year, gender,
              job_title, company, city, linkedin_url, bio, enrollment_number,
              show_phone_publicly, profile_picture, show_picture_publicly
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
      return res.json({
        user: {
          ...user,
          fullName: user.full_name,
          graduationYear: user.graduation_year,
          enrollmentNumber: user.enrollment_number,
          jobTitle: user.job_title,
          linkedinUrl: user.linkedin_url,
          profilePicture: user.profile_picture,
          showPhonePublicly: user.show_phone_publicly === true,
          showPicturePublicly: user.show_picture_publicly === true,
        },
        contactLocked: false
      });
    }

    const publicUser = sanitizePublicUser(user, isLoggedIn);
    return res.json({
      user: {
        ...publicUser,
        fullName: user.full_name,
        graduationYear: user.graduation_year,
        enrollmentNumber: user.enrollment_number,
        jobTitle: user.job_title,
        linkedinUrl: user.linkedin_url,
        showPhonePublicly: user.show_phone_publicly === true,
        showPicturePublicly: user.show_picture_publicly === true,
        profilePicture: user.show_picture_publicly === true ? user.profile_picture : null
      },
      contactLocked: !isLoggedIn
    });
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

  const { job_title, current_role, company, department, graduation_year, graduationYear, phone, city, linkedin_url, linkedinUrl, bio, showPhonePublicly, profile_picture, profilePicture, showPicturePublicly, full_name, fullName, gender, enrollment_number, enrollmentNumber, currentPassword, newPassword } = req.body;

  const allowedUpdates = [];
  const values = [];

  const pushUpdate = (column, value) => {
    allowedUpdates.push(`${column} = $${values.length + 1}`);
    values.push(value);
  };

  const targetFullName = fullName !== undefined ? fullName : full_name;
  if (targetFullName !== undefined) {
    pushUpdate('full_name', typeof targetFullName === 'string' ? targetFullName.trim() || null : targetFullName);
  }

  if (gender !== undefined) {
    pushUpdate('gender', typeof gender === 'string' ? gender.trim() || null : gender);
  }

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

  const targetGradYear = graduationYear !== undefined ? graduationYear : graduation_year;
  if (targetGradYear !== undefined) {
    pushUpdate('graduation_year', targetGradYear === '' ? null : targetGradYear);
  }

  const targetEnrollment = enrollmentNumber !== undefined ? enrollmentNumber : enrollment_number;
  if (targetEnrollment !== undefined) {
    pushUpdate('enrollment_number', typeof targetEnrollment === 'string' ? targetEnrollment.trim() || null : targetEnrollment);
  }

  if (phone !== undefined) {
    pushUpdate('phone', typeof phone === 'string' ? phone.trim() || null : phone);
  }

  if (city !== undefined) {
    pushUpdate('city', typeof city === 'string' ? city.trim() || null : city);
  }

  const targetLinkedin = linkedinUrl !== undefined ? linkedinUrl : linkedin_url;
  if (targetLinkedin !== undefined) {
    pushUpdate('linkedin_url', typeof targetLinkedin === 'string' ? targetLinkedin.trim() || null : targetLinkedin);
  }

  if (bio !== undefined) {
    pushUpdate('bio', typeof bio === 'string' ? bio.trim() || null : bio);
  }

  const targetPic = profilePicture !== undefined ? profilePicture : profile_picture;
  if (targetPic !== undefined) {
    if (targetPic === null || targetPic === '') {
      pushUpdate('profile_picture', null);
    } else {
      const savedPicPath = saveBase64Image(targetPic, 'avatars');
      pushUpdate('profile_picture', savedPicPath);
    }
  }

  if (showPhonePublicly !== undefined) {
    pushUpdate('show_phone_publicly', Boolean(showPhonePublicly));
  }

  if (showPicturePublicly !== undefined) {
    pushUpdate('show_picture_publicly', Boolean(showPicturePublicly));
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

    const updatedUserResult = await pool.query(
      `SELECT id, full_name, email, phone, role, department, graduation_year, gender, job_title, company, city, linkedin_url, bio, enrollment_number, show_phone_publicly, profile_picture, show_picture_publicly FROM users WHERE id = $1`,
      [id]
    );

    const u = updatedUserResult.rows[0];
    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        ...u,
        fullName: u.full_name,
        graduationYear: u.graduation_year,
        enrollmentNumber: u.enrollment_number,
        jobTitle: u.job_title,
        linkedinUrl: u.linkedin_url,
        profilePicture: u.profile_picture,
        showPhonePublicly: u.show_phone_publicly === true,
        showPicturePublicly: u.show_picture_publicly === true
      }
    });
  } catch (err) {
    console.error('Error updating user profile:', err);
    return res.status(500).json({ message: 'Server error while updating profile' });
  }
}

async function updateMyProfile(req, res) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const id = req.user.id;

  try {
    const userRes = await pool.query('SELECT role FROM users WHERE id = $1', [id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const role = (userRes.rows[0].role || '').toLowerCase();
    const isStudent = role === 'student';

    const {
      fullName, full_name,
      gender,
      department,
      graduationYear, graduation_year,
      enrollmentNumber, enrollment_number,
      jobTitle, job_title, current_role,
      company,
      phone,
      city,
      linkedinUrl, linkedin_url,
      bio,
      profilePicture, profile_picture,
      showPicturePublicly,
      showPhonePublicly
    } = req.body;

    const targetFullName = fullName !== undefined ? fullName : full_name;
    const targetGradYear = graduationYear !== undefined ? graduationYear : graduation_year;
    const targetEnrollment = enrollmentNumber !== undefined ? enrollmentNumber : enrollment_number;
    const targetJobTitle = jobTitle !== undefined ? jobTitle : (job_title !== undefined ? job_title : current_role);
    const targetLinkedin = linkedinUrl !== undefined ? linkedinUrl : linkedin_url;
    const targetPic = profilePicture !== undefined ? profilePicture : profile_picture;

    const allowedUpdates = [];
    const values = [];

    const pushUpdate = (column, value) => {
      allowedUpdates.push(`${column} = $${values.length + 1}`);
      values.push(value);
    };

    if (targetFullName !== undefined) {
      pushUpdate('full_name', typeof targetFullName === 'string' ? targetFullName.trim() || null : targetFullName);
    }
    if (gender !== undefined) {
      pushUpdate('gender', typeof gender === 'string' ? gender.trim() || null : gender);
    }
    if (department !== undefined) {
      pushUpdate('department', typeof department === 'string' ? department.trim() || null : department);
    }
    if (targetGradYear !== undefined) {
      const parsedYear = (targetGradYear === '' || targetGradYear === null) ? null : parseInt(targetGradYear, 10);
      pushUpdate('graduation_year', isNaN(parsedYear) ? null : parsedYear);
    }
    if (targetEnrollment !== undefined) {
      pushUpdate('enrollment_number', typeof targetEnrollment === 'string' ? targetEnrollment.trim() || null : targetEnrollment);
    }

    if (isStudent) {
      pushUpdate('job_title', 'Student');
      pushUpdate('company', 'The ICFAI University, Sikkim');
    } else {
      if (targetJobTitle !== undefined) {
        pushUpdate('job_title', typeof targetJobTitle === 'string' ? targetJobTitle.trim() || null : targetJobTitle);
      }
      if (company !== undefined) {
        pushUpdate('company', typeof company === 'string' ? company.trim() || null : company);
      }
    }

    if (phone !== undefined) {
      pushUpdate('phone', typeof phone === 'string' ? phone.trim() || null : phone);
    }
    if (city !== undefined) {
      pushUpdate('city', typeof city === 'string' ? city.trim() || null : city);
    }
    if (targetLinkedin !== undefined) {
      pushUpdate('linkedin_url', typeof targetLinkedin === 'string' ? targetLinkedin.trim() || null : targetLinkedin);
    }
    if (bio !== undefined) {
      pushUpdate('bio', typeof bio === 'string' ? bio.trim() || null : bio);
    }
    if (targetPic !== undefined) {
      if (targetPic === null || targetPic === '') {
        pushUpdate('profile_picture', null);
      } else {
        const savedPicPath = saveBase64Image(targetPic, 'avatars');
        pushUpdate('profile_picture', savedPicPath);
      }
    }
    if (showPicturePublicly !== undefined) {
      pushUpdate('show_picture_publicly', Boolean(showPicturePublicly));
    }
    if (showPhonePublicly !== undefined) {
      pushUpdate('show_phone_publicly', Boolean(showPhonePublicly));
    }

    if (allowedUpdates.length === 0) {
      return res.status(400).json({ success: false, message: 'No profile fields were provided to update.' });
    }

    values.push(id);

    await pool.query(
      `UPDATE users SET ${allowedUpdates.join(', ')} WHERE id = $${values.length}`,
      values
    );

    const updatedUserResult = await pool.query(
      `SELECT id, full_name, email, phone, role, department, graduation_year, gender, job_title, company, city, linkedin_url, bio, enrollment_number, profile_picture, show_picture_publicly, show_phone_publicly FROM users WHERE id = $1`,
      [id]
    );

    const u = updatedUserResult.rows[0];
    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        ...u,
        fullName: u.full_name,
        graduationYear: u.graduation_year,
        enrollmentNumber: u.enrollment_number,
        jobTitle: u.job_title,
        linkedinUrl: u.linkedin_url,
        profilePicture: u.profile_picture,
        showPhonePublicly: u.show_phone_publicly === true,
        showPicturePublicly: u.show_picture_publicly === true
      }
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    return res.status(500).json({ success: false, message: 'Server error while updating profile' });
  }
}

async function updateUserSettings(req, res) {
  const { id } = req.params;

  if (!req.user || Number(req.user.id) !== Number(id)) {
    return res.status(403).json({ message: 'You can only update your own settings' });
  }

  const { showPhonePublicly, showPicturePublicly, pictureVisible } = req.body;
  const updates = [];
  const params = [];

  if (showPhonePublicly !== undefined) {
    params.push(Boolean(showPhonePublicly));
    updates.push(`show_phone_publicly = $${params.length}`);
  }

  const targetPicVis = showPicturePublicly !== undefined ? showPicturePublicly : pictureVisible;
  if (targetPicVis !== undefined) {
    params.push(Boolean(targetPicVis));
    updates.push(`show_picture_publicly = $${params.length}`);
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: 'No settings provided to update.' });
  }

  params.push(id);

  try {
    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${params.length}`,
      params
    );

    return res.json({
      success: true,
      showPhonePublicly: showPhonePublicly !== undefined ? Boolean(showPhonePublicly) : undefined,
      showPicturePublicly: targetPicVis !== undefined ? Boolean(targetPicVis) : undefined,
      message: 'Settings updated successfully'
    });
  } catch (err) {
    console.error('Error updating user settings:', err);
    return res.status(500).json({ message: 'Server error while updating settings' });
  }
}

module.exports = { getUserProfile, updateUserProfile, updateMyProfile, updateUserSettings };
