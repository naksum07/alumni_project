let allJobs      = [];   // raw list from API
let filteredJobs = [];   // filtered list
let selectedJob  = null; // job currently open in the details modal
let appliedJobIds = [];  // IDs of jobs the logged-in user applied for

let currentPage = 1;
const itemsPerPage = 21;

//Element References
const jobContainer   = document.getElementById('jobContainer');
const noResults      = document.getElementById('noResults');
const resultCount    = document.getElementById('resultCount');
const searchInput    = document.getElementById('searchInput');
const filterType     = document.getElementById('filterType');
const filterLocation = document.getElementById('filterLocation');

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

//Fetch jobs from the API and display them
async function loadJobs() {
  resultCount.textContent = 'Loading opportunities…';
  jobContainer.innerHTML  = `
    <div class="col-span-3 text-center py-16 text-gray-400">
      <i class="fa-solid fa-spinner fa-spin text-4xl mb-4 block"></i>
      Loading opportunities…
    </div>`;
  try {
    const token = localStorage.getItem('token');
    const jobsPromise = fetch('/api/jobs');
    const appsPromise = token 
      ? fetch('/api/jobs/my-applications', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null)
      : Promise.resolve(null);

    const [res, appRes] = await Promise.all([jobsPromise, appsPromise]);

    if (appRes && appRes.ok) {
      const appData = await appRes.json();
      if (appData.appliedJobIds) appliedJobIds = appData.appliedJobIds;
    }

    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    allJobs = await res.json();
    currentPage = 1;
    displayJobs();
  } catch (err) {
    console.error('Failed to load jobs:', err);
    resultCount.textContent = 'Could not load opportunities.';
    jobContainer.innerHTML  = `
      <div class="col-span-3 text-center py-16 text-red-500">
        <i class="fa-solid fa-circle-exclamation text-4xl mb-4 block"></i>
        Could not load opportunities. Please refresh the page.
      </div>`;
  }
}

//Display jobs based on search and filter criteria
function displayJobs() {
  const search   = searchInput.value.toLowerCase();
  const type     = filterType.value;
  const location = filterLocation.value;

  filteredJobs = allJobs.filter(job => {
    const searchMatch =
      (job.title    || '').toLowerCase().includes(search) ||
      (job.company  || '').toLowerCase().includes(search) ||
      (job.skills   || '').toLowerCase().includes(search);

    const typeMatch =
      type === 'All' ||
      (job.job_type || '').toLowerCase() === type.toLowerCase();

    const locationMatch =
      location === 'All' ||
      (job.location || '').toLowerCase().includes(location.toLowerCase());

    return searchMatch && typeMatch && locationMatch;
  });

  resultCount.textContent = `${filteredJobs.length} opportunit${filteredJobs.length === 1 ? 'y' : 'ies'} available`;
  jobContainer.innerHTML  = '';

  if (filteredJobs.length === 0) {
    noResults.classList.remove('hidden');
    updatePaginationControls();
    return;
  }
  noResults.classList.add('hidden');

  const pageData = getPaginatedData();

  pageData.forEach(job => {
    const isJob  = (job.job_type || '').toLowerCase() === 'job';
    const badge  = isJob
      ? 'bg-green-100 text-green-700'
      : 'bg-amber-100 text-amber-700';
    const label  = isJob ? 'Job' : 'Internship';
    const isApplied = appliedJobIds.includes(job.id);
    const currentUser = getCurrentUser();
    const isOwnerOrAdmin = Boolean(
      currentUser &&
      job.posted_by &&
      (Number(job.posted_by) === Number(currentUser.id) || String(currentUser.role || '').toLowerCase() === 'admin')
    );

    const card = document.createElement('div');
    card.className =
      'bg-white rounded-2xl border border-slate-200 p-6 ' +
      'hover:shadow-xl hover:-translate-y-1 transition duration-300 relative flex flex-col justify-between';

    // Build inner HTML using safe text nodes to prevent XSS
    const companyInitial = (job.company || '?').charAt(0).toUpperCase();
    card.innerHTML = `
      <div>
        <div class="flex justify-between items-start">
          <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
            ${companyInitial}
          </div>
          <div class="flex flex-col items-end gap-1.5">
            <span class="${badge} px-3 py-1 rounded-full text-xs font-semibold">${label}</span>
            ${isApplied ? `<span class="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1"><i class="fa-solid fa-circle-check text-[10px]"></i> Applied</span>` : ''}
          </div>
        </div>
        <h3 class="text-xl font-bold mt-5 job-title-el"></h3>
        <p class="text-blue-600 font-semibold mt-1 job-company-el"></p>
        <div class="mt-5 space-y-2 text-sm text-slate-500">
          ${job.location ? `<p class="job-location-el">📍 </p>` : ''}
          ${job.salary   ? `<p class="job-salary-el">💰 </p>` : ''}
        </div>
        ${job.skills ? `<div class="bg-slate-50 border border-slate-100 rounded-lg p-3 mt-5 text-xs text-slate-600 job-skills-el"></div>` : ''}
      </div>
      <div class="flex gap-2 mt-5">
        <button
          class="view-details-btn flex-1 ${isApplied ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-700 hover:bg-blue-800'} text-white py-2.5 rounded-xl font-semibold transition flex items-center justify-center gap-2 shadow-sm">
          ${isApplied ? '<i class="fa-solid fa-check-circle"></i> Applied' : 'View Details'}
        </button>
        ${isOwnerOrAdmin ? `
          <button
            class="delete-job-card-btn bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3.5 py-2.5 rounded-xl font-semibold transition flex items-center justify-center gap-1 text-sm shadow-sm cursor-pointer"
            title="Delete Opportunity">
            <i class="fa-solid fa-trash"></i>
          </button>
        ` : ''}
      </div>`;

    // Set text content safely (prevents XSS)
    const titleEl = card.querySelector('.job-title-el');
    if (titleEl) titleEl.textContent = job.title || '';
    const companyEl = card.querySelector('.job-company-el');
    if (companyEl) companyEl.textContent = job.company || '';
    const locationEl = card.querySelector('.job-location-el');
    if (locationEl) locationEl.textContent = '📍 ' + (job.location || '');
    const salaryEl = card.querySelector('.job-salary-el');
    if (salaryEl) salaryEl.textContent = '💰 ' + (job.salary || '');
    const skillsEl = card.querySelector('.job-skills-el');
    if (skillsEl) skillsEl.textContent = job.skills || '';

    // Attach click safely via addEventListener
    const detailsBtn = card.querySelector('.view-details-btn');
    if (detailsBtn) detailsBtn.addEventListener('click', () => showDetails(job.id));

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

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch (err) {
    return null;
  }
}

function canPostOpportunity() {
  const user = getCurrentUser();
  if (!user) return true;
  const role = String(user.role || '').toLowerCase();
  return role === 'alumni' || role === 'admin';
}

function setPostOpportunityButtonsVisibility() {
  const buttons = document.querySelectorAll('[onclick="openPostModal()"]');
  buttons.forEach((btn) => {
    btn.style.display = '';
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

window.addEventListener('storage', () => {
  setPostOpportunityButtonsVisibility();
});

//Details Modal
function showDetails(id) {
  selectedJob = allJobs.find(j => j.id === id);
  if (!selectedJob) return;

  const isJob = (selectedJob.job_type || '').toLowerCase() === 'job';
  const badge = isJob ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700';
  const label = isJob ? 'Job' : 'Internship';
  const isApplied = appliedJobIds.includes(selectedJob.id);
  const currentUser = getCurrentUser();
  const isOwnerOrAdmin = Boolean(
    currentUser &&
    selectedJob.posted_by &&
    (Number(selectedJob.posted_by) === Number(currentUser.id) || String(currentUser.role || '').toLowerCase() === 'admin')
  );

  const detailsEl = document.getElementById('detailsContent');
  if (!detailsEl) return;

  detailsEl.innerHTML = `
    <div class="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xl company-initial-el"></div>
    <div class="flex items-center gap-2 mt-5">
      <span class="${badge} inline-block px-3 py-1 rounded-full text-xs font-semibold">${label}</span>
      ${isApplied ? `<span class="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1"><i class="fa-solid fa-circle-check"></i> Applied</span>` : ''}
    </div>
    <h2 class="text-3xl font-extrabold mt-4 detail-title-el"></h2>
    <p class="text-blue-600 font-semibold mt-1 detail-company-el"></p>
    ${selectedJob.posted_by_name ? `<p class="text-xs text-slate-500 mt-1">Shared by <strong class="text-slate-700">${escapeHTML(selectedJob.posted_by_name)}</strong></p>` : ''}
    <div class="mt-6 space-y-3 text-slate-600">
      ${selectedJob.location ? `<p class="detail-location-el">📍 </p>` : ''}
      ${selectedJob.salary   ? `<p class="detail-salary-el">💰 </p>`   : ''}
    </div>
    ${selectedJob.skills ? `
    <div class="border-t mt-7 pt-6">
      <h4 class="font-bold mb-2">Required Skills</h4>
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
        Apply Now
      </button>
    `}
    ${isOwnerOrAdmin ? `
      <button
        id="deleteOpportunityModalBtn"
        class="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-3 rounded-xl mt-3 font-semibold transition flex items-center justify-center gap-2 text-sm shadow-sm cursor-pointer">
        <i class="fa-solid fa-trash"></i> Delete Opportunity
      </button>
    ` : ''}`;

  // Set text content safely (prevents XSS)
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
  const detailSkillsEl = detailsEl.querySelector('.detail-skills-el');
  if (detailSkillsEl) detailSkillsEl.textContent = selectedJob.skills || '';
  const detailDescEl = detailsEl.querySelector('.detail-desc-el');
  if (detailDescEl) detailDescEl.textContent = selectedJob.description || '';
  const openApplyBtn = detailsEl.querySelector('#openApplyBtn');
  if (openApplyBtn) openApplyBtn.addEventListener('click', openApply);

  const deleteModalBtn = detailsEl.querySelector('#deleteOpportunityModalBtn');
  if (deleteModalBtn) {
    deleteModalBtn.addEventListener('click', () => deleteJobHandler(selectedJob.id));
  }

  openModal('detailsModal');
}

function closeDetails() { closeModal('detailsModal'); }

//Apply Modal
function openApply() {
  closeDetails();
  document.getElementById('applyJobTitle').textContent =
    `${selectedJob.title} — ${selectedJob.company}`;
  // clear previous messages
  const msg = document.getElementById('applyMessage');
  if (msg) { msg.textContent = ''; msg.className = 'text-sm font-medium hidden'; }
  document.getElementById('applicationForm').reset();

  const countrySelect = document.getElementById('appCountryCode');
  const phoneInput = document.getElementById('appPhone');
  if (countrySelect && phoneInput) {
    countrySelect.value = '+91';
    phoneInput.placeholder = '98765 43210';
  }

  // Autofill if logged in
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user) {
    const rawName = user.fullName || user.full_name || '';
    const parts = rawName.split(' ');
    if (parts.length === 1) {
      document.getElementById('appFirstName').value = parts[0] || '';
    } else if (parts.length === 2) {
      document.getElementById('appFirstName').value = parts[0] || '';
      document.getElementById('appLastName').value = parts[1] || '';
    } else if (parts.length >= 3) {
      document.getElementById('appFirstName').value = parts[0] || '';
      document.getElementById('appMiddleName').value = parts.slice(1, -1).join(' ') || '';
      document.getElementById('appLastName').value = parts[parts.length - 1] || '';
    }
    if (user.email) document.getElementById('appEmail').value = user.email;
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
function closeApply() { closeModal('applyModal'); }

// Setup country code change listener for jobs apply form
const appCountrySelect = document.getElementById('appCountryCode');
const appPhoneInput = document.getElementById('appPhone');
if (appCountrySelect && appPhoneInput) {
  appCountrySelect.addEventListener('change', function() {
    const selectedOption = appCountrySelect.options[appCountrySelect.selectedIndex];
    const format = selectedOption.getAttribute('data-format');
    if (format) {
      appPhoneInput.placeholder = format;
    }
  });
}

//Application Form Submission
document.getElementById('applicationForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const submitBtn = this.querySelector('button[type="submit"]');
  const msg       = document.getElementById('applyMessage');
  const firstName = document.getElementById('appFirstName').value.trim();
  const middleName = (document.getElementById('appMiddleName')?.value || '').trim();
  const lastName  = document.getElementById('appLastName').value.trim();
  const fullName  = [firstName, middleName, lastName].filter(Boolean).join(' ');

  const email      = document.getElementById('appEmail').value.trim();
  const countryCode = document.getElementById('appCountryCode')?.value || '+91';
  const rawPhone   = (document.getElementById('appPhone')?.value || '').trim();
  const phone      = rawPhone ? `${countryCode} ${rawPhone}` : '';
  const resumeUrl  = document.getElementById('appResume').value.trim();
  const coverLetter = document.getElementById('appCover').value.trim();

  submitBtn.disabled    = true;
  submitBtn.textContent = 'Submitting…';

  // Attach token if the user is logged in
  const token   = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  try {
    const res = await fetch(`/api/jobs/${selectedJob.id}/apply`, {
      method:  'POST',
      headers,
      body: JSON.stringify({ fullName, email, phone, coverLetter, resumeUrl }),
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
    setTimeout(closeApply, 2000);
  } catch (err) {
    console.error('Apply error:', err);
    showApplyMessage('Could not reach the server. Please try again later.', true);
  } finally {
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Submit Application';
  }
});

function showApplyMessage(text, isError) {
  const msg = document.getElementById('applyMessage');
  if (!msg) return;
  msg.textContent = text;
  msg.classList.remove('hidden', 'text-red-600', 'text-green-600');
  msg.classList.add(isError ? 'text-red-600' : 'text-green-600');
}

//Post Job Modal
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
document.getElementById('postForm').addEventListener('submit', async function (e) {
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
  submitBtn.disabled    = true;
  submitBtn.textContent = 'Publishing…';
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
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Publish Opportunity';
  }
});

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

//Modal Utility Functions
function openModal(id) {
  const el = document.getElementById(id);
  el.classList.remove('hidden');
  el.classList.add('flex');
}
function closeModal(id) {
  const el = document.getElementById(id);
  el.classList.add('hidden');
  el.classList.remove('flex');
}

// Close any modal on backdrop click
['detailsModal', 'applyModal', 'postModal', 'extDetailsModal'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', e => { if (e.target === el) closeModal(id); });
});

setPostOpportunityButtonsVisibility();

// Search and Filter Event Listeners
searchInput.addEventListener('input', () => { currentPage = 1; displayJobs(); });
filterType.addEventListener('change', () => { currentPage = 1; displayJobs(); });
filterLocation.addEventListener('change', () => { currentPage = 1; displayJobs(); });

const prevBtn = document.getElementById('prevPageBtn');
const nextBtn = document.getElementById('nextPageBtn');
if (prevBtn) prevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; displayJobs(); } });
if (nextBtn) nextBtn.addEventListener('click', () => {
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage) || 1;
  if (currentPage < totalPages) { currentPage++; displayJobs(); }
});

// ============================================================
//  EXTERNAL JOBS (Adzuna API)
// ============================================================

let extCurrentPage = 1;
let extTotalCount  = 0;
const EXT_PER_PAGE = 21;

const extPrevBtn = document.getElementById('extPrevBtn');
const extNextBtn = document.getElementById('extNextBtn');
if (extPrevBtn) extPrevBtn.addEventListener('click', () => { if (extCurrentPage > 1) loadExternalJobs(extCurrentPage - 1); });
if (extNextBtn) extNextBtn.addEventListener('click', () => {
  const totalPages = Math.ceil(extTotalCount / EXT_PER_PAGE);
  if (extCurrentPage < totalPages) loadExternalJobs(extCurrentPage + 1);
});

/** Switch between Alumni and External job tabs */
function switchJobTab(tab) {
  const alumniPanel   = document.getElementById('alumniJobsPanel');
  const externalPanel = document.getElementById('externalJobsPanel');
  const tabAlumni     = document.getElementById('tabAlumniJobs');
  const tabExternal   = document.getElementById('tabExternalJobs');

  // Also toggle the top search/filter bar visibility
  const topFilters = document.querySelector('section.max-w-6xl');

  if (tab === 'external') {
    alumniPanel.classList.add('hidden');
    externalPanel.classList.remove('hidden');
    if (topFilters) topFilters.classList.add('hidden');

    tabAlumni.className   = 'px-5 py-2.5 rounded-t-xl font-semibold text-sm transition border-b-2 border-transparent text-slate-500 hover:text-slate-700';
    tabExternal.className = 'px-5 py-2.5 rounded-t-xl font-semibold text-sm transition border-b-2 border-blue-600 text-blue-700 bg-blue-50';

    // Load external jobs on first switch if container is empty
    const container = document.getElementById('externalJobContainer');
    if (container && container.children.length === 0) {
      loadExternalJobs(1);
    }
  } else {
    alumniPanel.classList.remove('hidden');
    externalPanel.classList.add('hidden');
    if (topFilters) topFilters.classList.remove('hidden');

    tabAlumni.className   = 'px-5 py-2.5 rounded-t-xl font-semibold text-sm transition border-b-2 border-blue-600 text-blue-700 bg-blue-50';
    tabExternal.className = 'px-5 py-2.5 rounded-t-xl font-semibold text-sm transition border-b-2 border-transparent text-slate-500 hover:text-slate-700';
  }
}

/** Fetch external jobs from /api/external-jobs (Adzuna) */
async function loadExternalJobs(page = 1) {
  const container   = document.getElementById('externalJobContainer');
  const countEl     = document.getElementById('extResultCount');
  const pagination  = document.getElementById('extPagination');

  if (page < 1) return;
  extCurrentPage = page;

  if (countEl) countEl.textContent = 'Searching jobs from LinkedIn, Indeed, Glassdoor…';
  if (container) container.innerHTML = `
    <div class="col-span-3 text-center py-16 text-gray-400">
      <i class="fa-solid fa-spinner fa-spin text-4xl mb-4 block"></i>
      Fetching external opportunities…
    </div>`;
  if (pagination) pagination.classList.add('hidden');

  const what  = (document.getElementById('extSearchInput')?.value || '').trim();
  const where = (document.getElementById('extLocationInput')?.value || '').trim();

  const params = new URLSearchParams({
    page:     page,
    per_page: EXT_PER_PAGE,
    country:  'in',
  });
  if (what)  params.set('what', what);
  if (where) params.set('where', where);

  try {
    const res = await fetch(`/api/external-jobs?${params}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Server returned ${res.status}`);
    }

    const data = await res.json();
    extTotalCount = data.count || 0;

    if (!data.jobs || data.jobs.length === 0) {
      countEl.textContent = '0 external jobs found';
      container.innerHTML = `
        <div class="col-span-3 text-center py-16 text-slate-400">
          <div class="text-5xl mb-4">🔍</div>
          <h3 class="text-lg font-bold text-slate-600">No external jobs found</h3>
          <p class="mt-1">Try different keywords or location.</p>
        </div>`;
      return;
    }

    countEl.textContent = `${extTotalCount.toLocaleString()} external jobs found`;
    container.innerHTML = '';
    data.jobs.forEach((job, idx) => {
      const card = document.createElement('div');
      card.className =
        'bg-white rounded-2xl border border-slate-200 p-6 ' +
        'hover:shadow-xl hover:-translate-y-1 transition duration-300';

      const postedDate = job.postedDate
        ? new Date(job.postedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : '';

      const salaryText = (job.salary_min || job.salary_max)
        ? `💰 ${job.salary_min ? '₹' + Number(job.salary_min).toLocaleString() : ''} ${job.salary_min && job.salary_max ? '–' : ''} ${job.salary_max ? '₹' + Number(job.salary_max).toLocaleString() : ''}`
        : '';

      // Build card HTML with placeholders; fill text content safely below
      card.innerHTML = `
        <div class="flex justify-between items-start">
          <div class="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-bold text-lg ext-initial"></div>
          <span class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">External</span>
        </div>
        <h3 class="text-xl font-bold mt-5 ext-title"></h3>
        <p class="text-blue-600 font-semibold mt-1 ext-company"></p>
        <div class="mt-5 space-y-2 text-sm text-slate-500">
          ${job.location ? `<p class="ext-location">📍 </p>` : ''}
          ${salaryText   ? `<p class="ext-salary"></p>` : ''}
          ${postedDate   ? `<p class="ext-date">📅 </p>` : ''}
          ${job.category ? `<p class="ext-category">📂 </p>` : ''}
        </div>
        <p class="text-slate-500 text-sm mt-4 line-clamp-3 ext-desc"></p>
        <div class="flex gap-3 mt-5">
          <button class="ext-view-btn flex-1 bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-xl font-semibold transition shadow-sm">
            View Details
          </button>
          <a href="#" target="_blank" rel="noopener"
            class="ext-apply-link flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold transition text-center border border-slate-200">
            Apply ↗
          </a>
        </div>`;

      // Safely set all user-controlled text
      const extInitial = card.querySelector('.ext-initial');
      if (extInitial) extInitial.textContent = (job.company || '?').charAt(0).toUpperCase();
      const extTitle = card.querySelector('.ext-title');
      if (extTitle) extTitle.textContent = job.title || 'Untitled';
      const extCompany = card.querySelector('.ext-company');
      if (extCompany) extCompany.textContent = job.company || 'Unknown Company';
      const extLocation = card.querySelector('.ext-location');
      if (extLocation) extLocation.textContent = '📍 ' + job.location;
      const extSalary = card.querySelector('.ext-salary');
      if (extSalary) extSalary.textContent = salaryText;
      const extDate = card.querySelector('.ext-date');
      if (extDate) extDate.textContent = '📅 ' + postedDate;
      const extCategory = card.querySelector('.ext-category');
      if (extCategory) extCategory.textContent = '📂 ' + job.category;
      const extDesc = card.querySelector('.ext-desc');
      if (extDesc) extDesc.textContent = job.description || '';
      // Set the apply link href safely
      const extApplyLink = card.querySelector('.ext-apply-link');
      if (extApplyLink && job.jobUrl) extApplyLink.href = job.jobUrl;
      // Wire up the view details button safely (no inline onclick)
      const extViewBtn = card.querySelector('.ext-view-btn');
      if (extViewBtn) extViewBtn.addEventListener('click', () => showExtDetails(job));

      container.appendChild(card);
    });

    // Update pagination
    const totalPages = Math.ceil(extTotalCount / EXT_PER_PAGE);
    if (pagination) {
      if (totalPages > 1) {
        pagination.classList.remove('hidden');
        const pageInfo = document.getElementById('extPageInfo');
        const pBtn = document.getElementById('extPrevBtn');
        const nBtn = document.getElementById('extNextBtn');
        if (pageInfo) pageInfo.textContent = `Page ${extCurrentPage} of ${totalPages}`;
        if (pBtn) pBtn.disabled = (extCurrentPage <= 1);
        if (nBtn) nBtn.disabled = (extCurrentPage >= totalPages);
      } else {
        pagination.classList.add('hidden');
      }
    }

  } catch (err) {
    console.error('External jobs error:', err);
    countEl.textContent = 'Could not load external jobs.';
    container.innerHTML = `
      <div class="col-span-3 text-center py-16 text-red-500">
        <i class="fa-solid fa-circle-exclamation text-4xl mb-4 block"></i>
        ${err.message || 'Could not load external jobs. Please try again.'}
      </div>`;
  }
}

/** Show external job details in a modal */
function showExtDetails(job) {
  let modal = document.getElementById('extDetailsModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'extDetailsModal';
    modal.className = 'hidden fixed inset-0 z-[60] bg-slate-900/70 backdrop-blur-sm items-center justify-center p-5';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-8 relative">
          <button onclick="closeModal('extDetailsModal')" class="absolute right-5 top-4 text-3xl text-slate-400 hover:text-slate-700">&times;</button>
          <div id="extDetailsContent"></div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal('extDetailsModal'); });
  }

  const postedDate = job.postedDate
    ? new Date(job.postedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  const salaryText = (job.salary_min || job.salary_max)
    ? `₹${job.salary_min ? Number(job.salary_min).toLocaleString() : '?'} – ₹${job.salary_max ? Number(job.salary_max).toLocaleString() : '?'}`
    : '';

  document.getElementById('extDetailsContent').innerHTML = `
    <div class="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center font-bold text-2xl">
      ${(job.company || '?').charAt(0).toUpperCase()}
    </div>
    <span class="bg-emerald-100 text-emerald-700 inline-block px-3 py-1 rounded-full text-xs font-semibold mt-5">External · ${job.source || 'Adzuna'}</span>
    <h2 class="text-3xl font-extrabold mt-4">${job.title}</h2>
    <p class="text-blue-600 font-semibold mt-1">${job.company}</p>
    <div class="mt-6 space-y-3 text-slate-600">
      ${job.location ? `<p>📍 ${job.location}</p>` : ''}
      ${salaryText ? `<p>💰 ${salaryText}</p>` : ''}
      ${postedDate ? `<p>📅 Posted: ${postedDate}</p>` : ''}
      ${job.category ? `<p>📂 ${job.category}</p>` : ''}
    </div>
    ${job.description ? `
    <div class="mt-7">
      <h4 class="font-bold mb-2">About the Opportunity</h4>
      <p class="text-slate-600 leading-relaxed">${job.description}</p>
    </div>` : ''}
    <a href="${job.jobUrl}" target="_blank" rel="noopener"
      class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl mt-8 font-semibold block text-center transition">
      Apply on Original Site ↗
    </a>
    <p class="text-xs text-slate-400 text-center mt-3">You will be redirected to the original job listing</p>`;

  openModal('extDetailsModal');
}

// Allow Enter key to trigger external search
document.getElementById('extSearchInput')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') loadExternalJobs(1);
});
document.getElementById('extLocationInput')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') loadExternalJobs(1);
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