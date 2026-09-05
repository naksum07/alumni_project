function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const icon = btn && btn.querySelector('i');

  if (input.type === 'password') {
    input.type = 'text';
    if (icon) {
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    }
  } else {
    input.type = 'password';
    if (icon) {
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  }
}

// Profile API & Data Population
(function () {
  const API_BASE = '/api';

  const token = localStorage.getItem('token');
  const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');

  // Determine whose profile is being viewed
  const params = new URLSearchParams(window.location.search);
  const viewedUserId = params.get('id') || params.get('userId');

  // currentProfileData must be declared before renderProfile (which assigns to it)
  let currentProfileData = {};

  // If no specific user ID in URL and user is not logged in, redirect to login
  if (!viewedUserId && (!token || !loggedInUser)) {
    sessionStorage.setItem('returnTo', 'my-profile.html');
    window.location.href = 'login.html';
    return;
  }

  const isOwnProfile = !viewedUserId ? true : (loggedInUser ? String(viewedUserId) === String(loggedInUser.id) : false);

  function fill(selector, value, fallback) {
    const text = (value !== undefined && value !== null && value !== '') ? value : (fallback !== undefined ? fallback : '—');
    document.querySelectorAll(selector).forEach(el => {
      el.textContent = text;
    });
  }

  function show(el, visible) {
    if (!el) return;
    el.classList.toggle('hidden', !visible);
  }

  // Auth navbar handler (handled centrally by navbar.js)
  function setupNavbar() {}

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalizeUser(u) {
    if (!u) return {};
    return {
      ...u,
      id: u.id,
      fullName: u.fullName || u.full_name || '',
      full_name: u.full_name || u.fullName || '',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role || '',
      gender: u.gender || '',
      department: u.department || '',
      graduationYear: u.graduationYear || u.graduation_year || '',
      graduation_year: u.graduation_year || u.graduationYear || '',
      enrollmentNumber: u.enrollmentNumber || u.enrollment_number || '',
      enrollment_number: u.enrollment_number || u.enrollmentNumber || '',
      company: u.company || '',
      jobTitle: u.jobTitle || u.job_title || u.current_role || '',
      job_title: u.job_title || u.jobTitle || u.current_role || '',
      city: u.city || '',
      linkedinUrl: u.linkedinUrl || u.linkedin_url || '',
      linkedin_url: u.linkedin_url || u.linkedinUrl || '',
      bio: u.bio || '',
      profilePicture: u.profilePicture || u.profile_picture || null,
      profile_picture: u.profile_picture || u.profilePicture || null,
      showPhonePublicly: u.showPhonePublicly !== undefined ? u.showPhonePublicly : u.show_phone_publicly,
      show_phone_publicly: u.show_phone_publicly !== undefined ? u.show_phone_publicly : u.showPhonePublicly,
      showPicturePublicly: u.showPicturePublicly !== undefined ? u.showPicturePublicly : u.show_picture_publicly,
      show_picture_publicly: u.show_picture_publicly !== undefined ? u.show_picture_publicly : u.showPicturePublicly,
    };
  }

  // Render profile to DOM
  function renderProfile(rawUser) {
    const profileUser = normalizeUser(rawUser);
    currentProfileData = profileUser;

    const name = profileUser.fullName || 'Member';
    fill('[data-user-name]', name);
    fill('[data-user-email]', profileUser.email || (token ? '—' : 'Sign in to view email'));
    fill('[data-user-role]', profileUser.role);
    fill('[data-user-gender]', profileUser.gender, '—');
    fill('[data-user-dept]', profileUser.department, '—');
    fill('[data-user-year]', profileUser.graduationYear ? String(profileUser.graduationYear) : '—');
    fill('[data-user-city]', profileUser.city, '—');
    fill('[data-user-bio]', profileUser.bio, '—');

    const enrollmentNo = profileUser.enrollmentNumber || '';
    fill('[data-user-enrollment]', enrollmentNo, '—');
    const enrollmentWrap = document.getElementById('enrollmentWrap');
    if (enrollmentWrap) {
      show(enrollmentWrap, !!(enrollmentNo || (profileUser.role || '').toLowerCase() === 'student'));
    }

    const linkedinWrap = document.querySelector('[data-user-linkedin-wrap]');
    const linkedinUrl = profileUser.linkedinUrl;
    if (linkedinWrap) {
      if (linkedinUrl) {
        linkedinWrap.innerHTML = `<a href="${escapeHTML(linkedinUrl)}" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium text-sm"><i class="fa-brands fa-linkedin text-base"></i> View LinkedIn Profile ↗</a>`;
      } else {
        linkedinWrap.innerHTML = `<p class="text-gray-800 font-medium text-base">—</p>`;
      }
    }

    const avatar = document.getElementById('profileAvatarInitial');
    const avatarImg = document.getElementById('profileAvatarImg');
    const picUrl = profileUser.profilePicture;
    const showPicturePublicly = profileUser.showPicturePublicly === true;

    let pictureToShow = null;
    if (isOwnProfile) {
      pictureToShow = picUrl;
    } else if (showPicturePublicly && picUrl) {
      pictureToShow = picUrl;
    }

    if (pictureToShow && avatarImg) {
      avatarImg.src = pictureToShow;
      avatarImg.classList.remove('hidden');
      if (avatar) avatar.classList.add('hidden');
    } else {
      if (avatarImg) avatarImg.classList.add('hidden');
      if (avatar) {
        avatar.classList.remove('hidden');
        avatar.textContent = name.charAt(0).toUpperCase();
      }
    }

    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    if (pageTitle && pageSubtitle) {
      if (isOwnProfile) {
        pageTitle.textContent = 'My Profile';
        pageSubtitle.textContent = 'Manage your personal information and account settings.';
      } else {
        pageTitle.textContent = `${name}'s Profile`;
        pageSubtitle.textContent = `Viewing this ${profileUser.role || 'member'}'s public profile information.`;
      }
    }

    document.querySelectorAll('[data-owner-only]').forEach(el => show(el, isOwnProfile));

    // Picture privacy toggle card
    const pictureToggleCard = document.getElementById('pictureToggleCard');
    const pictureToggle = document.getElementById('picturePublicToggle');
    if (pictureToggleCard) {
      show(pictureToggleCard, isOwnProfile);
      if (pictureToggle) {
        pictureToggle.checked = showPicturePublicly;
        pictureToggle.disabled = !isOwnProfile;
      }
    }

    // Phone privacy
    const actualPhone = profileUser.phone || '';
    const showPhonePublicly = profileUser.showPhonePublicly === true;

    let phoneToShow;
    if (isOwnProfile) {
      phoneToShow = actualPhone || '—';
    } else if (showPhonePublicly && actualPhone) {
      phoneToShow = actualPhone;
    } else {
      phoneToShow = 'Hidden';
    }
    fill('[data-user-phone]', phoneToShow);

    const phoneToggleCard = document.getElementById('phoneToggleCard');
    const phoneToggle = document.getElementById('phonePublicToggle');
    if (phoneToggleCard) {
      show(phoneToggleCard, isOwnProfile);
      if (phoneToggle) {
        phoneToggle.checked = showPhonePublicly;
        phoneToggle.disabled = !isOwnProfile;
      }
    }

    // Role-based details
    const role = (profileUser.role || '').toLowerCase();
    const currentRoleLabel = document.getElementById('currentRoleLabel');
    const institutionLabel = document.getElementById('institutionLabel');
    const editBtn = document.getElementById('editProfessionBtn');

    if (role === 'student') {
      if (currentRoleLabel) currentRoleLabel.textContent = 'Current Role / Status';
      if (institutionLabel) institutionLabel.textContent = 'Institution';

      fill('[data-user-current-role]', 'Student');
      fill('[data-user-company]', 'The ICFAI University, Sikkim');
      show(editBtn, false);
    } else if (role === 'alumni') {
      if (currentRoleLabel) currentRoleLabel.textContent = 'Current Role / Profession';
      if (institutionLabel) institutionLabel.textContent = 'Company / Organisation';

      const currentRole = profileUser.jobTitle;
      const company = profileUser.company;
      fill('[data-user-current-role]', currentRole, 'None');
      fill('[data-user-company]', company, 'None');

      show(editBtn, isOwnProfile);
    } else {
      fill('[data-user-current-role]', profileUser.jobTitle, 'None');
      fill('[data-user-company]', profileUser.company, 'None');
      show(editBtn, false);
    }
  }

  async function loadProfile() {
    setupNavbar();

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const targetId = viewedUserId || (loggedInUser ? loggedInUser.id : null);
      if (!targetId) throw new Error('No user ID found');
      
      const res = await fetch(`${API_BASE}/users/${encodeURIComponent(targetId)}`, { headers });
      if (res.status === 404 && isOwnProfile) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
        return;
      }
      if (!res.ok) throw new Error(`Failed to load profile (status ${res.status})`);
      const data = await res.json();
      const serverUser = data.user || data;
      const combinedUser = isOwnProfile ? { ...loggedInUser, ...serverUser } : serverUser;
      renderProfile(combinedUser);
    } catch (err) {
      console.error('Could not load profile:', err);
      if (isOwnProfile && loggedInUser) {
        renderProfile(loggedInUser);
      } else {
        fill('[data-user-name]', 'Profile unavailable');
        fill('[data-user-phone]', 'Hidden');
        fill('[data-user-email]', '—');
      }
    } finally {
      loadMyPostedJobs();
    }
  }

  async function loadMyPostedJobs() {
    const section = document.getElementById('myPostedJobsSection');
    const container = document.getElementById('myPostedJobsList');
    if (!section || !container) return;

    const role = String(currentProfileData.role || loggedInUser?.role || '').toLowerCase();
    if (!isOwnProfile || (role !== 'alumni' && role !== 'admin')) {
      section.classList.add('hidden');
      return;
    }

    section.classList.remove('hidden');

    try {
      const res = await fetch('/api/jobs/my-posted-jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        container.innerHTML = `<p class="text-red-500 text-sm">Failed to load posted jobs.</p>`;
        return;
      }

      const jobs = data.jobs || [];
      if (jobs.length === 0) {
        container.innerHTML = `
          <div class="text-center py-8 text-gray-400">
            <i class="fa-solid fa-briefcase text-3xl mb-2 block"></i>
            <p class="text-sm font-medium">You haven't posted any job opportunities yet.</p>
            <a href="jobs.html" class="inline-block mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold">Post an Opportunity</a>
          </div>`;
        return;
      }

      container.innerHTML = '';
      jobs.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = 'border border-gray-200 rounded-xl p-5 bg-slate-50/50';

        const apps = job.applications || [];
        const appCount = apps.length;

        let appsHTML = '';
        if (appCount === 0) {
          appsHTML = `<p class="text-xs text-gray-400 italic mt-3">No applicants have enrolled for this job yet.</p>`;
        } else {
          appsHTML = `
            <div class="mt-4 pt-4 border-t border-gray-200 space-y-3">
              <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wide">Enrolled Applicants (${appCount})</h5>
              <div class="grid grid-cols-1 gap-3">
                ${apps.map(app => `
                  <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-slate-800 text-sm">${escapeHTML(app.full_name || 'Applicant')}</span>
                        ${app.gender ? `<span class="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded capitalize">${escapeHTML(app.gender)}</span>` : ''}
                        ${app.enrollment_number ? `<span class="bg-blue-50 text-blue-700 font-mono text-[11px] px-2 py-0.5 rounded font-semibold">Roll: ${escapeHTML(app.enrollment_number)}</span>` : ''}
                      </div>
                      <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span><i class="fa-solid fa-envelope text-slate-400 mr-1"></i>${escapeHTML(app.email || '—')}</span>
                        ${app.phone ? `<span><i class="fa-solid fa-phone text-slate-400 mr-1"></i>${escapeHTML(app.phone)}</span>` : ''}
                        ${app.department ? `<span><i class="fa-solid fa-graduation-cap text-slate-400 mr-1"></i>${escapeHTML(app.department)}</span>` : ''}
                        ${app.graduation_year ? `<span>Year: ${escapeHTML(String(app.graduation_year))}</span>` : ''}
                      </div>
                      ${app.cover_letter ? `
                        <p class="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg mt-2 border border-slate-100">
                          <strong class="text-slate-700">Note:</strong> ${escapeHTML(app.cover_letter)}
                        </p>
                      ` : ''}
                    </div>
                    <div class="shrink-0 flex items-center gap-2">
                      ${(app.resume_image_path || app.resume_url) ? `
                        <button onclick="viewResumeModal('${escapeHTML(app.resume_image_path || app.resume_url)}', '${escapeHTML(app.full_name)}')" class="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-lg font-semibold transition flex items-center gap-1.5 shadow-sm">
                          <i class="fa-solid fa-file-image"></i> View Resume Image
                        </button>
                      ` : `<span class="text-xs text-slate-400 italic">No Resume Uploaded</span>`}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>`;
        }

        const dateStr = job.created_at ? new Date(job.created_at).toLocaleDateString('en-IN') : '';
        jobCard.innerHTML = `
          <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <h4 class="font-bold text-slate-800 text-base">${escapeHTML(job.title)}</h4>
              <p class="text-xs text-slate-500">${escapeHTML(job.company)} • ${escapeHTML(job.location || 'Remote')} ${dateStr ? '• Posted ' + dateStr : ''}</p>
            </div>
            <div>
              <span class="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-bold">
                ${appCount} Applicant${appCount === 1 ? '' : 's'}
              </span>
            </div>
          </div>
          ${appsHTML}
        `;

        container.appendChild(jobCard);
      });

    } catch (err) {
      console.error('Failed to load posted jobs:', err);
      container.innerHTML = `<p class="text-red-500 text-sm">Error connecting to server to load posted jobs.</p>`;
    }
  }

  loadProfile();


  // Edit Profile Modal Handler
  const editProfileBtn = document.getElementById('editProfileBtn');
  const editProfileModal = document.getElementById('editProfileModal');
  const closeProfileModal = document.getElementById('closeProfileModal');
  const cancelProfileEdit = document.getElementById('cancelProfileEdit');
  const editProfileForm = document.getElementById('editProfileForm');
  const editProfileMessage = document.getElementById('editProfileMessage');

  const editFullNameInput = document.getElementById('editFullName');
  const editGenderInput = document.getElementById('editGender');
  const editDeptInput = document.getElementById('editDepartment');
  const editGradYearInput = document.getElementById('editGraduationYear');
  const editEnrollmentNoInput = document.getElementById('editEnrollmentNumber');
  const editJobTitleInput = document.getElementById('editJobTitle');
  const editCompanyInputEl = document.getElementById('editCompanyInput');
  const editPhoneInput = document.getElementById('editPhone');
  const editCityInput = document.getElementById('editCity');
  const editLinkedinUrlInput = document.getElementById('editLinkedinUrl');
  const editBioInput = document.getElementById('editBio');

  function setEditProfileMessage(text, isError) {
    if (!editProfileMessage) return;
    editProfileMessage.textContent = text;
    editProfileMessage.classList.remove('hidden', 'text-red-600', 'text-green-600');
    editProfileMessage.classList.add(isError ? 'text-red-600' : 'text-green-600');
  }


  function openEditProfileModal() {
    if (!editProfileModal) return;
    if (editFullNameInput) editFullNameInput.value = currentProfileData.fullName || currentProfileData.full_name || '';
    if (editGenderInput) editGenderInput.value = currentProfileData.gender || '';
    if (editDeptInput) editDeptInput.value = currentProfileData.department || '';
    if (editGradYearInput) editGradYearInput.value = currentProfileData.graduationYear || currentProfileData.graduation_year || '';
    if (editEnrollmentNoInput) editEnrollmentNoInput.value = currentProfileData.enrollmentNumber || currentProfileData.enrollment_number || '';
    if (editJobTitleInput) editJobTitleInput.value = currentProfileData.jobTitle || currentProfileData.job_title || '';
    if (editCompanyInputEl) editCompanyInputEl.value = currentProfileData.company || '';
    if (editPhoneInput) editPhoneInput.value = currentProfileData.phone || '';
    if (editCityInput) editCityInput.value = currentProfileData.city || '';
    if (editLinkedinUrlInput) editLinkedinUrlInput.value = currentProfileData.linkedin_url || currentProfileData.linkedinUrl || '';
    if (editBioInput) editBioInput.value = currentProfileData.bio || '';
    if (editProfileMessage) editProfileMessage.classList.add('hidden');

    const role = (currentProfileData.role || '').toLowerCase();
    const editEnrollmentWrap = document.getElementById('editEnrollmentWrap');
    const editAlumniProfessionWrap = document.getElementById('editAlumniProfessionWrap');
    if (editEnrollmentWrap) {
      editEnrollmentWrap.classList.toggle('hidden', role !== 'student');
    }
    if (editAlumniProfessionWrap) {
      editAlumniProfessionWrap.classList.toggle('hidden', role !== 'alumni');
    }

    editProfileModal.classList.remove('hidden');
  }

  function closeEditProfileModal() {
    if (!editProfileModal) return;
    editProfileModal.classList.add('hidden');
  }

  if (editProfileBtn) editProfileBtn.addEventListener('click', openEditProfileModal);
  if (closeProfileModal) closeProfileModal.addEventListener('click', closeEditProfileModal);
  if (cancelProfileEdit) cancelProfileEdit.addEventListener('click', closeEditProfileModal);
  if (editProfileModal) {
    editProfileModal.addEventListener('click', function(e) {
      if (e.target === editProfileModal) closeEditProfileModal();
    });
  }

  if (editProfileForm) {
    editProfileForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const activeToken = localStorage.getItem('token') || token;
      const activeUser = JSON.parse(localStorage.getItem('user') || 'null') || loggedInUser;

      if (!activeToken) {
        setEditProfileMessage('Please log in again to update your profile.', true);
        return;
      }

      const fullName = editFullNameInput ? editFullNameInput.value.trim() : '';
      const gender = editGenderInput ? editGenderInput.value : '';
      const department = editDeptInput ? editDeptInput.value.trim() : '';
      const graduationYear = editGradYearInput ? editGradYearInput.value.trim() : '';
      const enrollmentNumber = editEnrollmentNoInput ? editEnrollmentNoInput.value.trim() : '';
      const jobTitle = editJobTitleInput ? editJobTitleInput.value.trim() : '';
      const company = editCompanyInputEl ? editCompanyInputEl.value.trim() : '';
      const phone = editPhoneInput ? editPhoneInput.value.trim() : '';
      const city = editCityInput ? editCityInput.value.trim() : '';
      const linkedinUrl = editLinkedinUrlInput ? editLinkedinUrlInput.value.trim() : '';
      const bio = editBioInput ? editBioInput.value.trim() : '';

      const submitBtn = editProfileForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
      }

      try {
        const payload = {
          fullName,
          gender,
          department,
          graduationYear,
          enrollmentNumber,
          jobTitle,
          company,
          phone,
          city,
          linkedinUrl,
          bio
        };

        const res = await fetch(`${API_BASE}/users/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeToken}`
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Failed to update profile');

        if (data.user) {
          const merged = normalizeUser({ ...currentProfileData, ...data.user });
          currentProfileData = merged;
          localStorage.setItem('user', JSON.stringify({ ...(activeUser || {}), ...data.user }));
          renderProfile(currentProfileData);
        }

        closeEditProfileModal();
      } catch (err) {
        console.error('Edit profile error:', err);
        setEditProfileMessage(err.message || 'Error updating profile', true);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Save Changes';
        }
      }
    });
  }

  // Phone privacy toggle
  const phoneToggle = document.getElementById('phonePublicToggle');
  if (phoneToggle && isOwnProfile && loggedInUser) {
    phoneToggle.addEventListener('change', async function () {
      const newValue = phoneToggle.checked;
      const previousValue = !newValue;

      loggedInUser.showPhonePublicly = newValue;
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      fill('[data-user-phone]', loggedInUser.phone || '—');

      try {
        const res = await fetch(`${API_BASE}/users/${loggedInUser.id}/settings`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ showPhonePublicly: newValue })
        });

        if (!res.ok) {
          throw new Error(`Failed to update setting (status ${res.status})`);
        }
      } catch (err) {
        console.warn('Could not sync phone visibility to the server:', err);
        loggedInUser.showPhonePublicly = previousValue;
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        phoneToggle.checked = previousValue;
      }
    });
  }

  // Profile Picture privacy toggle
  const pictureToggle = document.getElementById('picturePublicToggle');
  if (pictureToggle && isOwnProfile && loggedInUser) {
    pictureToggle.addEventListener('change', async function () {
      const newValue = pictureToggle.checked;
      const previousValue = !newValue;

      loggedInUser.showPicturePublicly = newValue;
      loggedInUser.show_picture_publicly = newValue;
      localStorage.setItem('user', JSON.stringify(loggedInUser));

      try {
        const res = await fetch(`${API_BASE}/users/${loggedInUser.id}/settings`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ showPicturePublicly: newValue, pictureVisible: newValue })
        });

        if (!res.ok) {
          throw new Error(`Failed to update setting (status ${res.status})`);
        }
      } catch (err) {
        console.warn('Could not sync picture visibility to the server:', err);
        loggedInUser.showPicturePublicly = previousValue;
        loggedInUser.show_picture_publicly = previousValue;
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        pictureToggle.checked = previousValue;
      }
    });
  }

  // Avatar Options & Profile Picture Management
  function openAvatarOptionModal() {
    const modal = document.getElementById('avatarOptionModal');
    const deleteBtn = document.getElementById('btnDeletePicOption');
    if (!modal) return;
    const hasPic = Boolean(currentProfileData.profilePicture || currentProfileData.profile_picture);
    if (deleteBtn) {
      deleteBtn.classList.toggle('hidden', !hasPic);
    }
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  function closeAvatarOptionModal() {
    const modal = document.getElementById('avatarOptionModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }
  window.closeAvatarOptionModal = closeAvatarOptionModal;

  const avatarActionBtn = document.getElementById('avatarActionBtn');
  if (avatarActionBtn) {
    avatarActionBtn.addEventListener('click', openAvatarOptionModal);
  }

  const btnUploadPicOption = document.getElementById('btnUploadPicOption');
  if (btnUploadPicOption) {
    btnUploadPicOption.addEventListener('click', () => {
      closeAvatarOptionModal();
      const heroPicInput = document.getElementById('heroProfilePicInput');
      if (heroPicInput) heroPicInput.click();
    });
  }

  async function deleteProfilePicture() {
    if (!token || !loggedInUser) return;
    try {
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ profilePicture: null })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to delete profile picture');

      currentProfileData = { ...currentProfileData, profilePicture: null, profile_picture: null };
      if (loggedInUser) {
        loggedInUser.profilePicture = null;
        loggedInUser.profile_picture = null;
        localStorage.setItem('user', JSON.stringify(loggedInUser));
      }
      renderProfile(currentProfileData);
      closeAvatarOptionModal();
    } catch (err) {
      console.error('Delete picture error:', err);
      if (typeof showPopup === 'function') {
        showPopup(err.message || 'Failed to delete profile picture', 'error');
      }
    }
  }

  const btnDeletePicOption = document.getElementById('btnDeletePicOption');
  if (btnDeletePicOption) {
    btnDeletePicOption.addEventListener('click', () => {
      if (typeof showConfirmPopup === 'function') {
        showConfirmPopup(
          'Are you sure you want to delete your profile picture?',
          'Delete Profile Picture',
          deleteProfilePicture,
          null,
          'Delete',
          'Cancel'
        );
      } else if (confirm('Are you sure you want to delete your profile picture?')) {
        deleteProfilePicture();
      }
    });
  }

  // Upload Profile Picture handler
  async function uploadProfilePicture(base64Data) {
    if (!token || !loggedInUser) return;
    try {
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ profilePicture: base64Data })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to upload profile picture');

      if (data.user) {
        currentProfileData = { ...currentProfileData, ...data.user };
        localStorage.setItem('user', JSON.stringify({ ...loggedInUser, ...data.user }));
        renderProfile(currentProfileData);
      }
      closeAvatarOptionModal();
    } catch (err) {
      console.error('Upload picture error:', err);
      if (typeof showPopup === 'function') {
        showPopup(err.message || 'Failed to upload profile picture', 'error');
      }
    }
  }

  const heroPicInput = document.getElementById('heroProfilePicInput');
  if (heroPicInput) {
    heroPicInput.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (!file) return;
      if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
        if (typeof showPopup === 'function') showPopup('Please select a PNG or JPEG image.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => uploadProfilePicture(evt.target.result);
      reader.readAsDataURL(file);
    });
  }

  // Alumni profession inline edit
  const editBtn = document.getElementById('editProfessionBtn');
  const viewMode = document.getElementById('professionViewMode');
  const editForm = document.getElementById('professionEditForm');
  const cancelBtn = document.getElementById('cancelProfessionEdit');
  const editCurrentRoleInput = document.getElementById('editCurrentRole');
  const editCompanyInput = document.getElementById('editCompany');

  function enterEditMode() {
    const currentRoleText = document.querySelector('[data-user-current-role]').textContent;
    const companyText = document.querySelector('[data-user-company]').textContent;
    editCurrentRoleInput.value = currentRoleText === 'None' ? '' : currentRoleText;
    editCompanyInput.value = companyText === 'None' ? '' : companyText;

    show(viewMode, false);
    show(editForm, true);
    editForm.classList.remove('hidden');
    editForm.classList.add('grid');
  }

  function exitEditMode() {
    show(editForm, false);
    show(viewMode, true);
    viewMode.classList.remove('hidden');
    viewMode.classList.add('grid');
  }

  if (editBtn) editBtn.addEventListener('click', enterEditMode);
  if (cancelBtn) cancelBtn.addEventListener('click', exitEditMode);

  if (editForm && isOwnProfile && loggedInUser) {
    editForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const newCurrentRole = editCurrentRoleInput.value.trim();
      const newCompany = editCompanyInput.value.trim();

      try {
        const res = await fetch(`${API_BASE}/users/${loggedInUser.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ job_title: newCurrentRole, company: newCompany })
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || `Failed to save changes (status ${res.status})`);

        loggedInUser.job_title = newCurrentRole;
        loggedInUser.current_role = newCurrentRole;
        loggedInUser.company = newCompany;
        localStorage.setItem('user', JSON.stringify(loggedInUser));

        fill('[data-user-current-role]', newCurrentRole, 'None');
        fill('[data-user-company]', newCompany, 'None');
        exitEditMode();
      } catch (err) {
        console.error('Could not save profession details:', err);
        showPopup(err.message || 'Could not save your changes. Please try again.', 'error');
      }
    });
  }

  const changePasswordBtn = document.getElementById('changePasswordBtn');
  const changePasswordModal = document.getElementById('changePasswordModal');
  const closePasswordModal = document.getElementById('closePasswordModal');
  const cancelPasswordChange = document.getElementById('cancelPasswordChange');
  const changePasswordForm = document.getElementById('changePasswordForm');
  const passwordFormMessage = document.getElementById('passwordFormMessage');
  const resetPasswordEmail = document.getElementById('resetPasswordEmail');

  function setPasswordMessage(message, isError) {
    if (!passwordFormMessage) return;
    passwordFormMessage.textContent = message;
    passwordFormMessage.classList.remove('hidden', 'text-red-600', 'text-green-600');
    passwordFormMessage.classList.add(isError ? 'text-red-600' : 'text-green-600');
  }

  function openPasswordModal() {
    if (!changePasswordModal) return;
    if (resetPasswordEmail) {
      resetPasswordEmail.textContent = loggedInUser && loggedInUser.email ? loggedInUser.email : 'your email';
    }
    changePasswordModal.classList.remove('hidden');
  }

  function closePasswordModalView() {
    if (!changePasswordModal) return;
    changePasswordModal.classList.add('hidden');
    if (passwordFormMessage) {
      passwordFormMessage.classList.add('hidden');
      passwordFormMessage.textContent = '';
    }
  }

  if (changePasswordBtn) changePasswordBtn.addEventListener('click', openPasswordModal);
  if (closePasswordModal) closePasswordModal.addEventListener('click', closePasswordModalView);
  if (cancelPasswordChange) cancelPasswordChange.addEventListener('click', closePasswordModalView);
  if (changePasswordModal) {
    changePasswordModal.addEventListener('click', function (event) {
      if (event.target === changePasswordModal) closePasswordModalView();
    });
  }

  if (changePasswordForm && isOwnProfile && loggedInUser) {
    changePasswordForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const email = loggedInUser.email;
      if (!email) {
        setPasswordMessage('No email is available for this account.', true);
        return;
      }

      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Unable to send verification link.');

        setPasswordMessage('A reset verification link has been sent to your email.', false);
        setTimeout(() => closePasswordModalView(), 1800);
      } catch (err) {
        console.error('Could not send reset link:', err);
        setPasswordMessage(err.message || 'Unable to send verification link. Please try again.', true);
      }
    });
  }

  // Mobile menu toggle
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      mobileMenu.classList.toggle('hidden');
      const isOpen = !mobileMenu.classList.contains('hidden');
      menuBtn.setAttribute('aria-expanded', isOpen);
      menuBtn.innerHTML = isOpen ? '✕' : '☰';
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.innerHTML = '☰';
      });
    });
  }
})();

window.viewResumeModal = function(imgUrl, applicantName) {
  const modal = document.getElementById('resumeModal');
  const modalImg = document.getElementById('resumeModalImg');
  const modalTitle = document.getElementById('resumeModalTitle');
  if (modal && modalImg) {
    modalImg.src = imgUrl;
    if (modalTitle) modalTitle.textContent = `${applicantName} — Resume`;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
};

window.closeResumeModal = function() {
  const modal = document.getElementById('resumeModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
};