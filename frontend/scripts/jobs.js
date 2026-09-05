let allJobs        = [];   // merged raw list (Alumni + External)
let filteredJobs   = [];   // filtered list
let selectedJob    = null; // job currently open in details/apply modal
let appliedJobIds  = [];  // IDs of jobs the logged-in user applied for
let selectedResumeBase64 = ''; // Base64 image payload for resume upload

let currentPage = 1;
const itemsPerPage = 21;

// Element References
const jobContainer   = document.getElementById('jobContainer');
const noResults      = document.getElementById('noResults');
const resultCount    = document.getElementById('resultCount');
const searchInput    = document.getElementById('searchInput');
const filterSource   = document.getElementById('filterSource');
const filterType     = document.getElementById('filterType');
const filterLocation = document.getElementById('filterLocation');

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch (err) {
    return null;
  }
}

function isStudentLoggedIn() {
  const token = localStorage.getItem('token');
  const user = getCurrentUser();
  return Boolean(token && user && String(user.role || '').toLowerCase() === 'student');
}

function canPostOpportunity() {
  const user = getCurrentUser();
  if (!user) return false;
  const role = String(user.role || '').toLowerCase();
  return role === 'alumni' || role === 'admin';
}

function setPostOpportunityButtonsVisibility() {
  const isAllowed = canPostOpportunity();
  const buttons = document.querySelectorAll('[onclick="openPostModal()"]');
  buttons.forEach((btn) => {
    btn.style.display = isAllowed ? '' : 'none';
  });
}

function updatePaginationControls() {
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage) || 1;
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');
  const pageIndicator = document.getElementById('pageIndicator');
  const paginationControls = document.getElementById('paginationControls');

  if (filteredJobs.length <= itemsPerPage) {
    if (paginationControls) {
      paginationControls.classList.add('hidden');
      paginationControls.classList.remove('flex');
    }
  } else {
    if (paginationControls) {
      paginationControls.classList.remove('hidden');
      paginationControls.classList.add('flex');
    }
  }

  if (prevBtn) prevBtn.disabled = currentPage === 1;
  if (nextBtn) nextBtn.disabled = currentPage === totalPages;
  if (pageIndicator) pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
}

function getPaginatedData() {
  const startIndex = (currentPage - 1) * itemsPerPage;
  return filteredJobs.slice(startIndex, startIndex + itemsPerPage);
}

/**
 * Fetch both alumni jobs and external jobs (Adzuna), merge them into allJobs
 */
async function loadJobs() {
  if (resultCount) resultCount.textContent = 'Loading opportunities…';
  if (jobContainer) {
    jobContainer.innerHTML = `
      <div class="col-span-3 text-center py-16 text-gray-400">
        <i class="fa-solid fa-spinner fa-spin text-4xl mb-4 block"></i>
        Loading opportunities…
      </div>`;
  }

  try {
    const token = localStorage.getItem('token');

    const alumniPromise = fetch('/api/jobs').then(r => r.ok ? r.json() : []);
    const externalPromise = fetch('/api/external-jobs?per_page=30').then(r => r.ok ? r.json() : { jobs: [] }).catch(() => ({ jobs: [] }));
    const appsPromise = token
      ? fetch('/api/jobs/my-applications', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.ok ? r.json() : null).catch(() => null)
      : Promise.resolve(null);

    const [alumniData, externalData, appData] = await Promise.all([alumniPromise, externalPromise, appsPromise]);

    if (appData && appData.appliedJobIds) {
      appliedJobIds = appData.appliedJobIds;
    }

    const alumniJobs = (Array.isArray(alumniData) ? alumniData : []).map(j => ({
      ...j,
      isExternal: false,
      source: 'Alumni',
      job_type: j.job_type || 'Job'
    }));

    const extJobs = (externalData && Array.isArray(externalData.jobs) ? externalData.jobs : []).map((j, idx) => ({
      id: `ext_${idx}_${Date.now()}`,
      title: j.title || 'Untitled',
      company: j.company || 'Unknown Company',
      location: j.location || '',
      job_type: 'Job',
      salary: (j.salary_min || j.salary_max)
        ? `₹${j.salary_min ? Number(j.salary_min).toLocaleString() : ''} ${j.salary_min && j.salary_max ? '–' : ''} ${j.salary_max ? '₹' + Number(j.salary_max).toLocaleString() : ''}`
        : '',
      skills: j.category || '',
      description: j.description || '',
      jobUrl: j.jobUrl || '#',
      postedDate: j.postedDate || '',
      isExternal: true,
      source: 'External'
    }));

    // Unified list: alumni jobs first, followed by external jobs
    allJobs = [...alumniJobs, ...extJobs];
    currentPage = 1;
    displayJobs();
  } catch (err) {
    console.error('Failed to load jobs:', err);
    if (resultCount) resultCount.textContent = 'Could not load opportunities.';
    if (jobContainer) {
      jobContainer.innerHTML = `
        <div class="col-span-3 text-center py-16 text-red-500">
          <i class="fa-solid fa-circle-exclamation text-4xl mb-4 block"></i>
          Could not load opportunities. Please refresh the page.
        </div>`;
    }
  }
}

/**
 * Display jobs based on search, source, type, and location filters
 */
function displayJobs() {
  const search   = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const source   = filterSource ? filterSource.value : 'All';
  const type     = filterType ? filterType.value : 'All';
  const location = filterLocation ? filterLocation.value : 'All';

  filteredJobs = allJobs.filter(job => {
    const searchMatch =
      !search ||
      (job.title       || '').toLowerCase().includes(search) ||
      (job.company     || '').toLowerCase().includes(search) ||
      (job.skills      || '').toLowerCase().includes(search) ||
      (job.description || '').toLowerCase().includes(search);

    const sourceMatch =
      source === 'All' ||
      (job.source || '').toLowerCase() === source.toLowerCase();

    const typeMatch =
      type === 'All' ||
      (job.job_type || '').toLowerCase() === type.toLowerCase();

    const locationMatch =
      location === 'All' ||
      (job.location || '').toLowerCase().includes(location.toLowerCase());

    return searchMatch && sourceMatch && typeMatch && locationMatch;
  });

  if (resultCount) {
    resultCount.textContent = `${filteredJobs.length} opportunit${filteredJobs.length === 1 ? 'y' : 'ies'} available`;
  }
  if (!jobContainer) return;
  jobContainer.innerHTML = '';

  if (filteredJobs.length === 0) {
    if (noResults) noResults.classList.remove('hidden');
    updatePaginationControls();
    return;
  }
  if (noResults) noResults.classList.add('hidden');

  const pageData = getPaginatedData();

  pageData.forEach(job => {
    const isJob = (job.job_type || '').toLowerCase() === 'job';
    const typeBadgeClass = isJob ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700';
    const typeLabel = isJob ? 'Job' : 'Internship';

    const isAlumni = job.source === 'Alumni';
    const sourceBadgeClass = isAlumni ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700';
    const sourceLabel = job.source || (isAlumni ? 'Alumni' : 'External');

    const isApplied = !job.isExternal && appliedJobIds.includes(job.id);
    const currentUser = getCurrentUser();
    const isOwnerOrAdmin = Boolean(
      !job.isExternal &&
      currentUser &&
      job.posted_by &&
      (Number(job.posted_by) === Number(currentUser.id) || String(currentUser.role || '').toLowerCase() === 'admin')
    );

    const card = document.createElement('div');
    card.className =
      'bg-white rounded-2xl border border-slate-200 p-6 ' +
      'hover:shadow-xl hover:-translate-y-1 transition duration-300 relative flex flex-col justify-between';

    const companyInitial = (job.company || '?').charAt(0).toUpperCase();

    card.innerHTML = `
      <div>
        <div class="flex justify-between items-start">
          <div class="w-12 h-12 rounded-xl ${isAlumni ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'} flex items-center justify-center font-bold text-lg">
            ${companyInitial}
          </div>
          <div class="flex flex-col items-end gap-1.5">
            <div class="flex items-center gap-1.5">
              <span class="${sourceBadgeClass} px-2.5 py-0.5 rounded-full text-[11px] font-bold">${sourceLabel}</span>
              <span class="${typeBadgeClass} px-2.5 py-0.5 rounded-full text-[11px] font-bold">${typeLabel}</span>
            </div>
            ${isApplied ? `<span class="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1"><i class="fa-solid fa-circle-check text-[10px]"></i> Applied</span>` : ''}
          </div>
        </div>
        <h3 class="text-xl font-bold mt-5 job-title-el"></h3>
        <p class="text-blue-600 font-semibold mt-1 job-company-el"></p>
        <div class="mt-4 space-y-1.5 text-sm text-slate-500">
          ${job.location ? `<p class="job-location-el">📍 </p>` : ''}
          ${job.salary   ? `<p class="job-salary-el">💰 </p>`   : ''}
          ${job.postedDate ? `<p class="job-date-el">📅 Posted: </p>` : ''}
        </div>
        ${job.skills ? `<div class="bg-slate-50 border border-slate-100 rounded-lg p-3 mt-4 text-xs text-slate-600 job-skills-el"></div>` : ''}
      </div>
      <div class="flex gap-2 mt-5">
        <button
          class="view-details-btn flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-sm border border-slate-200">
          View Details
        </button>
        ${isApplied ? `
          <button disabled class="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-semibold text-sm cursor-not-allowed flex items-center justify-center gap-1.5">
            <i class="fa-solid fa-circle-check text-xs"></i> Applied
          </button>
        ` : `
          <button
            class="apply-now-card-btn flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold transition flex items-center justify-center gap-1.5 text-sm shadow-sm">
            Apply ${job.isExternal ? '↗' : ''}
          </button>
        `}
        ${isOwnerOrAdmin ? `
          <button
            class="delete-job-card-btn bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3.5 py-2.5 rounded-xl font-semibold transition flex items-center justify-center gap-1 text-sm shadow-sm cursor-pointer"
            title="Delete Opportunity">
            <i class="fa-solid fa-trash"></i>
          </button>
        ` : ''}
      </div>`;

    // Safely set text content (prevents XSS)
    const titleEl = card.querySelector('.job-title-el');
    if (titleEl) titleEl.textContent = job.title || '';
    const companyEl = card.querySelector('.job-company-el');
    if (companyEl) companyEl.textContent = job.company || '';
    const locationEl = card.querySelector('.job-location-el');
    if (locationEl) locationEl.textContent = '📍 ' + (job.location || '');
    const salaryEl = card.querySelector('.job-salary-el');
    if (salaryEl) salaryEl.textContent = '💰 ' + (job.salary || '');
    const dateEl = card.querySelector('.job-date-el');
    if (dateEl && job.postedDate) {
      const formatted = new Date(job.postedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      dateEl.textContent = '📅 Posted: ' + formatted;
    }
    const skillsEl = card.querySelector('.job-skills-el');
    if (skillsEl) skillsEl.textContent = job.skills || '';

    // Attach event handlers
    const detailsBtn = card.querySelector('.view-details-btn');
    if (detailsBtn) detailsBtn.addEventListener('click', () => showDetails(job));

    const applyBtn = card.querySelector('.apply-now-card-btn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => handleApplyClick(job));
    }

    const deleteBtn = card.querySelector('.delete-job-card-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteJobHandler(job.id);
      });
    }

    jobContainer.appendChild(card);
  });

  updatePaginationControls();
}

/**
 * Handle Apply button clicks for both Alumni and External jobs.
 * Enforces requirement #2: registered, logged-in student check.
 */
function handleApplyClick(job) {
  if (!isStudentLoggedIn()) {
    promptStudentLogin();
    return;
  }

  if (job.isExternal) {
    if (job.jobUrl) {
      window.open(job.jobUrl, '_blank', 'noopener,noreferrer');
    }
  } else {
    selectedJob = job;
    openApply();
  }
}

function promptStudentLogin() {
  const msg = 'Only registered, logged-in students can apply for job opportunities. Please log in to your student account.';
  if (typeof showConfirmPopup === 'function') {
    showConfirmPopup(
      msg,
      'Student Login Required',
      () => { window.location.href = 'login.html'; },
      null,
      'Go to Login',
      'Cancel'
    );
  } else {
    alert(msg);
    window.location.href = 'login.html';
  }
}

// Show Details Modal
function showDetails(job) {
  selectedJob = job;
  if (!selectedJob) return;

  const isJob = (selectedJob.job_type || '').toLowerCase() === 'job';
  const typeBadgeClass = isJob ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700';
  const typeLabel = isJob ? 'Job' : 'Internship';

  const isAlumni = selectedJob.source === 'Alumni';
  const sourceBadgeClass = isAlumni ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700';
  const sourceLabel = selectedJob.source || 'Opportunity';

  const isApplied = !selectedJob.isExternal && appliedJobIds.includes(selectedJob.id);
  const currentUser = getCurrentUser();
  const isOwnerOrAdmin = Boolean(
    !selectedJob.isExternal &&
    currentUser &&
    selectedJob.posted_by &&
    (Number(selectedJob.posted_by) === Number(currentUser.id) || String(currentUser.role || '').toLowerCase() === 'admin')
  );

  const detailsEl = document.getElementById('detailsContent');
  if (!detailsEl) return;

  detailsEl.innerHTML = `
    <div class="w-16 h-16 rounded-2xl ${isAlumni ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'} flex items-center justify-center font-bold text-2xl company-initial-el"></div>
    <div class="flex items-center gap-2 mt-5">
      <span class="${sourceBadgeClass} inline-block px-3 py-1 rounded-full text-xs font-semibold">${sourceLabel}</span>
      <span class="${typeBadgeClass} inline-block px-3 py-1 rounded-full text-xs font-semibold">${typeLabel}</span>
      ${isApplied ? `<span class="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1"><i class="fa-solid fa-circle-check"></i> Applied</span>` : ''}
    </div>
    <h2 class="text-3xl font-extrabold mt-4 detail-title-el"></h2>
    <p class="text-blue-600 font-semibold mt-1 detail-company-el"></p>
    ${selectedJob.posted_by_name ? `<p class="text-xs text-slate-500 mt-1">Shared by <strong class="text-slate-700">${escapeHTML(selectedJob.posted_by_name)}</strong></p>` : ''}
    <div class="mt-6 space-y-3 text-slate-600">
      ${selectedJob.location ? `<p class="detail-location-el">📍 </p>` : ''}
      ${selectedJob.salary   ? `<p class="detail-salary-el">💰 </p>`   : ''}
      ${selectedJob.postedDate ? `<p class="detail-date-el">📅 Posted: </p>` : ''}
    </div>
    ${selectedJob.skills ? `
    <div class="border-t mt-7 pt-6">
      <h4 class="font-bold mb-2">Required Skills / Field</h4>
      <p class="text-slate-600 detail-skills-el"></p>
    </div>` : ''}
    ${selectedJob.description ? `
    <div class="mt-7">
      <h4 class="font-bold mb-2">About the Opportunity</h4>
      <p class="text-slate-600 leading-relaxed detail-desc-el"></p>
    </div>` : ''}
    ${isApplied ? `
      <button disabled class="w-full bg-emerald-600 text-white py-3.5 rounded-xl mt-8 font-semibold cursor-not-allowed flex items-center justify-center gap-2 shadow">
        <i class="fa-solid fa-circle-check"></i> Applied
      </button>
    ` : `
      <button
        id="openApplyBtn"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl mt-8 font-semibold shadow transition">
        Apply Now ${selectedJob.isExternal ? '↗' : ''}
      </button>
    `}
    ${isOwnerOrAdmin ? `
      <button
        id="deleteOpportunityModalBtn"
        class="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-3 rounded-xl mt-3 font-semibold transition flex items-center justify-center gap-2 text-sm shadow-sm cursor-pointer">
        <i class="fa-solid fa-trash"></i> Delete Opportunity
      </button>
    ` : ''}`;

  // Safely set text content
  const companyInitialEl = detailsEl.querySelector('.company-initial-el');
  if (companyInitialEl) companyInitialEl.textContent = (selectedJob.company || '?').charAt(0).toUpperCase();
  const detailTitleEl = detailsEl.querySelector('.detail-title-el');
  if (detailTitleEl) detailTitleEl.textContent = selectedJob.title || '';
  const detailCompanyEl = detailsEl.querySelector('.detail-company-el');
  if (detailCompanyEl) detailCompanyEl.textContent = selectedJob.company || '';
  const detailLocationEl = detailsEl.querySelector('.detail-location-el');
  if (detailLocationEl) detailLocationEl.textContent = '📍 ' + (selectedJob.location || '');
  const detailSalaryEl = detailsEl.querySelector('.detail-salary-el');
  if (detailSalaryEl) detailSalaryEl.textContent = '💰 ' + (selectedJob.salary || '');
  const detailDateEl = detailsEl.querySelector('.detail-date-el');
  if (detailDateEl && selectedJob.postedDate) {
    const formatted = new Date(selectedJob.postedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    detailDateEl.textContent = '📅 Posted: ' + formatted;
  }
  const detailSkillsEl = detailsEl.querySelector('.detail-skills-el');
  if (detailSkillsEl) detailSkillsEl.textContent = selectedJob.skills || '';
  const detailDescEl = detailsEl.querySelector('.detail-desc-el');
  if (detailDescEl) detailDescEl.textContent = selectedJob.description || '';

  const openApplyBtn = detailsEl.querySelector('#openApplyBtn');
  if (openApplyBtn) {
    openApplyBtn.addEventListener('click', () => {
      closeDetails();
      handleApplyClick(selectedJob);
    });
  }

  const deleteModalBtn = detailsEl.querySelector('#deleteOpportunityModalBtn');
  if (deleteModalBtn) {
    deleteModalBtn.addEventListener('click', () => deleteJobHandler(selectedJob.id));
  }

  openModal('detailsModal');
}

function closeDetails() { closeModal('detailsModal'); }

// Apply Modal Initialization & Resume File Handling
function openApply() {
  if (!isStudentLoggedIn()) {
    promptStudentLogin();
    return;
  }

  closeDetails();
  const titleEl = document.getElementById('applyJobTitle');
  if (titleEl && selectedJob) {
    titleEl.textContent = `${selectedJob.title} — ${selectedJob.company}`;
  }

  // Clear previous messages & reset form
  const msg = document.getElementById('applyMessage');
  if (msg) { msg.textContent = ''; msg.className = 'text-sm font-medium hidden'; }

  const form = document.getElementById('applicationForm');
  if (form) form.reset();

  resetResumeFileInput();

  const countrySelect = document.getElementById('appCountryCode');
  const phoneInput = document.getElementById('appPhone');
  if (countrySelect && phoneInput) {
    countrySelect.value = '+91';
    phoneInput.placeholder = '98765 43210';
  }

  // Autofill user details
  const user = getCurrentUser();
  if (user) {
    const rawName = user.fullName || user.full_name || '';
    const parts = rawName.split(' ');
    if (parts.length === 1) {
      if (document.getElementById('appFirstName')) document.getElementById('appFirstName').value = parts[0] || '';
    } else if (parts.length === 2) {
      if (document.getElementById('appFirstName')) document.getElementById('appFirstName').value = parts[0] || '';
      if (document.getElementById('appLastName')) document.getElementById('appLastName').value = parts[1] || '';
    } else if (parts.length >= 3) {
      if (document.getElementById('appFirstName')) document.getElementById('appFirstName').value = parts[0] || '';
      if (document.getElementById('appMiddleName')) document.getElementById('appMiddleName').value = parts.slice(1, -1).join(' ') || '';
      if (document.getElementById('appLastName')) document.getElementById('appLastName').value = parts[parts.length - 1] || '';
    }
    if (user.email && document.getElementById('appEmail')) document.getElementById('appEmail').value = user.email;
    if (user.phone) {
      const match = user.phone.match(/^(\+\d{1,4})\s*(.*)$/);
      if (match && countrySelect) {
        countrySelect.value = match[1];
        if (phoneInput) phoneInput.value = match[2];
      } else if (phoneInput) {
        phoneInput.value = user.phone;
      }
    }
  }

  openModal('applyModal');
}

function closeApply() {
  closeModal('applyModal');
  resetResumeFileInput();
}

function resetResumeFileInput() {
  selectedResumeBase64 = '';
  const fileInput = document.getElementById('appResumeFile');
  const dropzone = document.getElementById('appResumeDropzone');
  const fileLabel = document.getElementById('resumeFileLabel');
  const previewWrap = document.getElementById('resumePreviewWrap');
  const previewImg = document.getElementById('resumePreview');
  const fileName = document.getElementById('resumeFileName');
  const fileSize = document.getElementById('resumeFileSize');

  if (fileInput) fileInput.value = '';
  if (fileLabel) fileLabel.textContent = 'Choose Resume Image...';
  if (dropzone) dropzone.classList.remove('hidden');
  if (previewWrap) previewWrap.classList.add('hidden');
  if (previewImg) previewImg.src = '';
  if (fileName) fileName.textContent = '';
  if (fileSize) fileSize.textContent = '';
}

// Wire up resume image file input listener
const resumeFileInput = document.getElementById('appResumeFile');
if (resumeFileInput) {
  resumeFileInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) {
      resetResumeFileInput();
      return;
    }

    if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
      if (typeof showPopup === 'function') {
        showPopup('Please select an image file (PNG or JPEG format only).', 'error');
      } else {
        alert('Please select an image file (PNG or JPEG format only).');
      }
      resetResumeFileInput();
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      if (typeof showPopup === 'function') {
        showPopup('Image file size must be less than 5MB.', 'error');
      } else {
        alert('Image file size must be less than 5MB.');
      }
      resetResumeFileInput();
      return;
    }

    const reader = new FileReader();
    reader.onload = function (evt) {
      selectedResumeBase64 = evt.target.result;

      const dropzone = document.getElementById('appResumeDropzone');
      const previewWrap = document.getElementById('resumePreviewWrap');
      const previewImg = document.getElementById('resumePreview');
      const fileName = document.getElementById('resumeFileName');
      const fileSize = document.getElementById('resumeFileSize');

      if (previewImg) previewImg.src = evt.target.result;
      if (fileName) fileName.textContent = file.name;
      if (fileSize) fileSize.textContent = (file.size / 1024).toFixed(1) + ' KB';
      if (dropzone) dropzone.classList.add('hidden');
      if (previewWrap) previewWrap.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });
}

const removeResumeBtn = document.getElementById('removeResumeBtn');
if (removeResumeBtn) {
  removeResumeBtn.addEventListener('click', resetResumeFileInput);
}

// Country code change listener
const appCountrySelect = document.getElementById('appCountryCode');
const appPhoneInput = document.getElementById('appPhone');
if (appCountrySelect && appPhoneInput) {
  appCountrySelect.addEventListener('change', function () {
    const selectedOption = appCountrySelect.options[appCountrySelect.selectedIndex];
    const format = selectedOption.getAttribute('data-format');
    if (format) {
      appPhoneInput.placeholder = format;
    }
  });
}

// Application Form Submission
const applicationForm = document.getElementById('applicationForm');
if (applicationForm) {
  applicationForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!isStudentLoggedIn()) {
      promptStudentLogin();
      return;
    }

    if (!selectedResumeBase64) {
      showApplyMessage('Please upload your resume as an image file (PNG/JPEG).', true);
      return;
    }

    const submitBtn = this.querySelector('button[type="submit"]');
    const firstName = document.getElementById('appFirstName').value.trim();
    const middleName = (document.getElementById('appMiddleName')?.value || '').trim();
    const lastName  = document.getElementById('appLastName').value.trim();
    const fullName  = [firstName, middleName, lastName].filter(Boolean).join(' ');

    const email      = document.getElementById('appEmail').value.trim();
    const countryCode = document.getElementById('appCountryCode')?.value || '+91';
    const rawPhone   = (document.getElementById('appPhone')?.value || '').trim();
    const phone      = rawPhone ? `${countryCode} ${rawPhone}` : '';
    const coverLetter = document.getElementById('appCover').value.trim();

    if (submitBtn) {
      submitBtn.disabled    = true;
      submitBtn.textContent = 'Submitting…';
    }

    const token   = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`/api/jobs/${selectedJob.id}/apply`, {
        method:  'POST',
        headers,
        body: JSON.stringify({
          fullName,
          email,
          phone,
          coverLetter,
          resumeImage: selectedResumeBase64
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showApplyMessage(data.message || 'Submission failed. Please try again.', true);
        return;
      }
      showApplyMessage('✅ Application submitted successfully!', false);
      if (selectedJob && selectedJob.id && !appliedJobIds.includes(selectedJob.id)) {
        appliedJobIds.push(selectedJob.id);
        displayJobs();
      }
      this.reset();
      resetResumeFileInput();
      setTimeout(closeApply, 2000);
    } catch (err) {
      console.error('Apply error:', err);
      showApplyMessage('Could not reach the server. Please try again later.', true);
    } finally {
      if (submitBtn) {
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Submit Application';
      }
    }
  });
}

function showApplyMessage(text, isError) {
  const msg = document.getElementById('applyMessage');
  if (!msg) return;
  msg.textContent = text;
  msg.classList.remove('hidden', 'text-red-600', 'text-green-600');
  msg.classList.add(isError ? 'text-red-600' : 'text-green-600');
}

// Post Job Modal
function openPostModal() {
  const token = localStorage.getItem('token');
  const user = getCurrentUser();

  if (!token || !user) {
    if (typeof showConfirmPopup === 'function') {
      showConfirmPopup(
        'You need to be logged in as an Alumni to post job opportunities.',
        'Login Required',
        () => { window.location.href = 'login.html'; },
        null,
        'Go to Login',
        'Cancel'
      );
    } else {
      window.location.href = 'login.html';
    }
    return;
  }

  const role = String(user.role || '').toLowerCase();
  if (role !== 'alumni' && role !== 'admin') {
    if (typeof showPopup === 'function') {
      showPopup('Only alumni and administrators can post job opportunities.', 'error');
    } else {
      alert('Only alumni and administrators can post job opportunities.');
    }
    return;
  }

  const msg = document.getElementById('postStatusMessage');
  if (msg) {
    msg.textContent = '';
    msg.className = 'hidden';
  }
  openModal('postModal');
}

function closePostModal() {
  const msg = document.getElementById('postStatusMessage');
  if (msg) {
    msg.textContent = '';
    msg.className = 'hidden';
  }
  closeModal('postModal');
}

const postForm = document.getElementById('postForm');
if (postForm) {
  postForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const currentUser = getCurrentUser();

    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    const role = String(currentUser?.role || '').toLowerCase();
    if (!currentUser || (role !== 'alumni' && role !== 'admin')) {
      showPostStatus('Only alumni and administrators can post opportunities.', true);
      return;
    }
    const submitBtn = this.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled    = true;
      submitBtn.textContent = 'Publishing…';
    }
    const body = {
      title:       document.getElementById('postTitle').value.trim(),
      company:     document.getElementById('postCompany').value.trim(),
      jobType:     document.getElementById('postType').value,
      location:    document.getElementById('postLocation').value.trim(),
      salary:      document.getElementById('postSalary').value.trim(),
      skills:      document.getElementById('postSkills').value.trim(),
      description: document.getElementById('postDesc').value.trim(),
    };
    try {
      const res = await fetch('/api/jobs', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        showPostStatus(data.message || 'Failed to post job. Please try again.', true);
        return;
      }
      showPostStatus('✅ Opportunity posted successfully!', false);
      if (typeof showPopup === 'function') {
        showPopup('Opportunity posted successfully!', 'success');
      }
      this.reset();
      closePostModal();
      await loadJobs(); // refresh the list
    } catch (err) {
      console.error('Post job error:', err);
      showPostStatus('Could not reach the server. Please try again later.', true);
    } finally {
      if (submitBtn) {
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Publish Opportunity';
      }
    }
  });
}

function showPostStatus(message, isError = false) {
  const msg = document.getElementById('postStatusMessage');
  if (!msg) return;
  msg.textContent = message;
  msg.classList.remove('hidden', 'text-red-600', 'text-green-600');
  msg.classList.add(isError ? 'text-red-600' : 'text-green-600');
  msg.className = `text-sm font-medium ${isError ? 'text-red-600' : 'text-green-600'}`;
}

async function deleteJobHandler(jobId) {
  const token = localStorage.getItem('token');
  if (!token) {
    if (typeof showPopup === 'function') {
      showPopup('Authentication required to delete job opportunity.', 'error');
    }
    return;
  }

  const executeDelete = async () => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        if (typeof showPopup === 'function') {
          showPopup(data.message || 'Failed to delete job.', 'error');
        } else {
          alert(data.message || 'Failed to delete job.');
        }
        return;
      }
      if (typeof showPopup === 'function') {
        showPopup('Job opportunity deleted successfully.', 'success');
      } else {
        alert('Job opportunity deleted successfully.');
      }
      if (selectedJob && selectedJob.id === jobId) {
        closeDetails();
      }
      await loadJobs();
    } catch (err) {
      console.error('Delete job error:', err);
      if (typeof showPopup === 'function') {
        showPopup('Could not reach the server. Please try again later.', 'error');
      }
    }
  };

  if (typeof showConfirmPopup === 'function') {
    showConfirmPopup(
      'Are you sure you want to delete this job opportunity? This action cannot be undone.',
      'Delete Opportunity',
      executeDelete,
      null,
      'Delete',
      'Cancel'
    );
  } else if (confirm('Are you sure you want to delete this job opportunity?')) {
    executeDelete();
  }
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Modal Utility Functions
function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('hidden');
  el.classList.add('flex');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('hidden');
  el.classList.remove('flex');
}

// Close modals on backdrop click
['detailsModal', 'applyModal', 'postModal'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', e => { if (e.target === el) closeModal(id); });
});

setPostOpportunityButtonsVisibility();

// Search and Filter Event Listeners
if (searchInput)    searchInput.addEventListener('input', () => { currentPage = 1; displayJobs(); });
if (filterSource)   filterSource.addEventListener('change', () => { currentPage = 1; displayJobs(); });
if (filterType)     filterType.addEventListener('change', () => { currentPage = 1; displayJobs(); });
if (filterLocation) filterLocation.addEventListener('change', () => { currentPage = 1; displayJobs(); });

const prevBtn = document.getElementById('prevPageBtn');
const nextBtn = document.getElementById('nextPageBtn');
if (prevBtn) prevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; displayJobs(); } });
if (nextBtn) nextBtn.addEventListener('click', () => {
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage) || 1;
  if (currentPage < totalPages) { currentPage++; displayJobs(); }
});

// Scroll to Top
const topButton = document.getElementById('topButton');
if (topButton) {
  window.addEventListener('scroll', () => {
    topButton.classList.toggle('hidden', window.scrollY <= 300);
  });
  topButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Boot
loadJobs();