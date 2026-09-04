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

  // Auth navbar handler
  function setupNavbar() {
    const navAuth = document.getElementById('navAuth');
    const mobileNavAuth = document.getElementById('mobileNavAuth');

    if (token && loggedInUser) {
      const firstName = (loggedInUser.fullName || loggedInUser.full_name || 'You').split(' ')[0];

      if (navAuth) {
        navAuth.innerHTML = `
          <span class="text-slate-700 font-medium text-sm">Hi, <strong class="text-[#012970]">${firstName}</strong></span>
          <a href="my-profile.html"
             class="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:border-[#012970] hover:text-[#012970] transition text-sm ${isOwnProfile ? 'border-[#012970] text-[#012970] font-semibold' : ''}">
            👤 My Profile
          </a>
          <button data-logout
             class="bg-[#c4161c] hover:bg-[#a01217] text-white font-semibold px-4 py-2 rounded-lg transition text-sm shadow-sm">
            Logout
          </button>`;
      }

      if (mobileNavAuth) {
        mobileNavAuth.innerHTML = `
          <p class="text-slate-700 text-sm py-1">Logged in as <strong class="text-[#012970]">${firstName}</strong></p>
          <a href="my-profile.html"
             class="block text-center border border-slate-300 text-slate-700 py-2 rounded-lg hover:border-[#012970] hover:text-[#012970] transition text-sm ${isOwnProfile ? 'border-[#012970] text-[#012970] font-semibold' : ''}">
            👤 My Profile
          </a>
          <button data-logout
             class="w-full text-center bg-[#c4161c] hover:bg-[#a01217] text-white py-2 rounded-lg font-semibold text-sm transition">
            Logout
          </button>`;
      }
    } else {
      if (navAuth) {
        navAuth.innerHTML = `
          <a href="../admin/login.html"
             class="text-slate-500 font-medium hover:text-[#012970] transition text-sm px-2 border-r border-gray-200 pr-4">
            Admin Login
          </a>
          <a href="login.html"
             class="bg-[#c4161c] hover:bg-[#a01217] text-white font-semibold px-5 py-2 rounded-lg transition text-sm shadow-sm">
            Login / Register
          </a>`;
      }
 
      if (mobileNavAuth) {
        mobileNavAuth.innerHTML = `
          <a href="../admin/login.html"
             class="block text-center text-slate-500 py-2 rounded-lg font-medium hover:bg-gray-100 transition text-sm border-b border-gray-200 pb-3 mb-3">
            Admin Login
          </a>
          <div class="space-y-2">
            <a href="login.html"
               class="block text-center bg-[#c4161c] hover:bg-[#a01217] text-white py-2 rounded-lg font-semibold text-sm transition">
              Login / Register
            </a>
          </div>`;
      }
    }

    // Logout actions
    document.querySelectorAll('[data-logout]').forEach(btn => {
      btn.addEventListener('click', function () {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
      });
    });
  }

  // Render profile to DOM
  function renderProfile(profileUser) {
    currentProfileData = profileUser;
    const name = profileUser.fullName || profileUser.full_name || 'Member';
    fill('[data-user-name]', name);
    fill('[data-user-email]', profileUser.email || (token ? '—' : 'Sign in to view email'));
    fill('[data-user-role]', profileUser.role);
    fill('[data-user-dept]', profileUser.department, '—');
    fill('[data-user-year]', profileUser.graduation_year ? String(profileUser.graduation_year) : '—');
    fill('[data-user-city]', profileUser.city, '—');
    fill('[data-user-bio]', profileUser.bio, '—');

    const enrollmentNo = profileUser.enrollment_number || profileUser.enrollmentNumber || '';
    fill('[data-user-enrollment]', enrollmentNo, '—');
    const enrollmentWrap = document.getElementById('enrollmentWrap');
    if (enrollmentWrap) {
      show(enrollmentWrap, !!(enrollmentNo || (profileUser.role || '').toLowerCase() === 'student'));
    }

    const linkedinWrap = document.querySelector('[data-user-linkedin-wrap]');
    const linkedinUrl = profileUser.linkedinUrl || profileUser.linkedin_url;
    if (linkedinWrap) {
      if (linkedinUrl) {
        linkedinWrap.innerHTML = `<a href="${linkedinUrl}" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium text-sm"><i class="fa-brands fa-linkedin text-base"></i> View LinkedIn Profile ↗</a>`;
      } else {
        linkedinWrap.innerHTML = `<p class="text-gray-800 font-medium text-base">—</p>`;
      }
    }

    const avatar = document.getElementById('profileAvatarInitial');
    if (avatar) avatar.textContent = name.charAt(0).toUpperCase();

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

    // Phone privacy
    const actualPhone = profileUser.phone || '';
    const showPhonePublicly = profileUser.showPhonePublicly === true || profileUser.show_phone_publicly === true;

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

      const currentRole = profileUser.job_title || profileUser.current_role || '';
      const company = profileUser.company || '';
      fill('[data-user-current-role]', currentRole, 'None');
      fill('[data-user-company]', company, 'None');

      show(editBtn, isOwnProfile);
    } else {
      fill('[data-user-current-role]', profileUser.job_title || profileUser.current_role, 'None');
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
      renderProfile(data.user || data);
    } catch (err) {
      console.error('Could not load profile:', err);
      fill('[data-user-name]', 'Profile unavailable');
      fill('[data-user-phone]', 'Hidden');
      fill('[data-user-email]', '—');
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

  const editPhoneInput = document.getElementById('editPhone');
  const editCityInput = document.getElementById('editCity');
  const editLinkedinUrlInput = document.getElementById('editLinkedinUrl');
  const editBioInput = document.getElementById('editBio');

  let currentProfileData = {};

  function setEditProfileMessage(text, isError) {
    if (!editProfileMessage) return;
    editProfileMessage.textContent = text;
    editProfileMessage.classList.remove('hidden', 'text-red-600', 'text-green-600');
    editProfileMessage.classList.add(isError ? 'text-red-600' : 'text-green-600');
  }

  function openEditProfileModal() {
    if (!editProfileModal) return;
    if (editPhoneInput) editPhoneInput.value = currentProfileData.phone || '';
    if (editCityInput) editCityInput.value = currentProfileData.city || '';
    if (editLinkedinUrlInput) editLinkedinUrlInput.value = currentProfileData.linkedin_url || currentProfileData.linkedinUrl || '';
    if (editBioInput) editBioInput.value = currentProfileData.bio || '';
    if (editProfileMessage) editProfileMessage.classList.add('hidden');
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

  if (editProfileForm && isOwnProfile && loggedInUser) {
    editProfileForm.addEventListener('submit', async function(e) {
      e.preventDefault();
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
        const res = await fetch(`${API_BASE}/users/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ phone, city, linkedinUrl, bio })
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Failed to update profile');

        setEditProfileMessage('✅ Profile updated successfully!', false);

        if (data.user) {
          currentProfileData = { ...currentProfileData, ...data.user };
          localStorage.setItem('user', JSON.stringify({ ...loggedInUser, ...data.user }));
          renderProfile(currentProfileData);
        }

        setTimeout(() => {
          closeEditProfileModal();
        }, 1200);
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
        alert(err.message || 'Could not save your changes. Please try again.');
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