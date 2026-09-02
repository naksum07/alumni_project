let allJobs    = [];   // raw list from API
let selectedJob = null; // job currently open in the details modal

//Element References
const jobContainer   = document.getElementById('jobContainer');
const noResults      = document.getElementById('noResults');
const resultCount    = document.getElementById('resultCount');
const searchInput    = document.getElementById('searchInput');
const filterType     = document.getElementById('filterType');
const filterLocation = document.getElementById('filterLocation');

//Fetch jobs from the API and display them
async function loadJobs() {
  resultCount.textContent = 'Loading opportunities…';
  jobContainer.innerHTML  = `
    <div class="col-span-3 text-center py-16 text-gray-400">
      <i class="fa-solid fa-spinner fa-spin text-4xl mb-4 block"></i>
      Loading opportunities…
    </div>`;
  try {
    const res = await fetch('/api/jobs');
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    allJobs = await res.json();
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

  const filtered = allJobs.filter(job => {
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

  resultCount.textContent = `${filtered.length} opportunit${filtered.length === 1 ? 'y' : 'ies'} available`;
  jobContainer.innerHTML  = '';

  if (filtered.length === 0) {
    noResults.classList.remove('hidden');
    return;
  }
  noResults.classList.add('hidden');

  filtered.forEach(job => {
    const isJob  = (job.job_type || '').toLowerCase() === 'job';
    const badge  = isJob
      ? 'bg-green-100 text-green-700'
      : 'bg-amber-100 text-amber-700';
    const label  = isJob ? 'Job' : 'Internship';

    const card = document.createElement('div');
    card.className =
      'bg-white rounded-2xl border border-slate-200 p-6 ' +
      'hover:shadow-xl hover:-translate-y-1 transition duration-300';

    card.innerHTML = `
      <div class="flex justify-between items-start">
        <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
          ${(job.company || '?').charAt(0).toUpperCase()}
        </div>
        <span class="${badge} px-3 py-1 rounded-full text-xs font-semibold">${label}</span>
      </div>
      <h3 class="text-xl font-bold mt-5">${job.title}</h3>
      <p class="text-blue-600 font-semibold mt-1">${job.company}</p>
      <div class="mt-5 space-y-2 text-sm text-slate-500">
        ${job.location ? `<p>📍 ${job.location}</p>` : ''}
        ${job.salary   ? `<p>💰 ${job.salary}</p>`   : ''}
      </div>
      ${job.skills ? `<div class="bg-slate-50 border border-slate-100 rounded-lg p-3 mt-5 text-xs text-slate-600">${job.skills}</div>` : ''}
      <button
        onclick="showDetails(${job.id})"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl mt-5 font-semibold transition">
        View Opportunity
      </button>`;

    jobContainer.appendChild(card);
  });
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
  return Boolean(user && String(user.role || '').toLowerCase() === 'alumni');
}

function setPostOpportunityButtonsVisibility() {
  const buttons = document.querySelectorAll('[onclick="openPostModal()"]');
  buttons.forEach((btn) => {
    btn.style.display = canPostOpportunity() ? '' : 'none';
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

  document.getElementById('detailsContent').innerHTML = `
    <div class="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xl">
      ${(selectedJob.company || '?').charAt(0).toUpperCase()}
    </div>
    <span class="${badge} inline-block px-3 py-1 rounded-full text-xs font-semibold mt-5">${label}</span>
    <h2 class="text-3xl font-extrabold mt-4">${selectedJob.title}</h2>
    <p class="text-blue-600 font-semibold mt-1">${selectedJob.company}</p>
    <div class="mt-6 space-y-3 text-slate-600">
      ${selectedJob.location ? `<p>📍 ${selectedJob.location}</p>` : ''}
      ${selectedJob.salary   ? `<p>💰 ${selectedJob.salary}</p>`   : ''}
    </div>
    ${selectedJob.skills ? `
    <div class="border-t mt-7 pt-6">
      <h4 class="font-bold mb-2">Required Skills</h4>
      <p class="text-slate-600">${selectedJob.skills}</p>
    </div>` : ''}
    ${selectedJob.description ? `
    <div class="mt-7">
      <h4 class="font-bold mb-2">About the Opportunity</h4>
      <p class="text-slate-600 leading-relaxed">${selectedJob.description}</p>
    </div>` : ''}
    <button
      onclick="openApply()"
      class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl mt-8 font-semibold">
      Apply Now
    </button>`;

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
  if (!canPostOpportunity()) {
    showPostStatus('Only alumni can post opportunities.', true);
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

  if (!currentUser || String(currentUser.role || '').toLowerCase() !== 'alumni') {
    showPostStatus('Only alumni can post opportunities.', true);
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
['detailsModal', 'applyModal', 'postModal'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', e => { if (e.target === el) closeModal(id); });
});

setPostOpportunityButtonsVisibility();

// Search and Filter Event Listeners
searchInput.addEventListener('input', displayJobs);
filterType.addEventListener('change', displayJobs);
filterLocation.addEventListener('change', displayJobs);

// Scroll to Top
const topButton = document.getElementById('topButton');
if (topButton) {
  window.addEventListener('scroll', () => {
    topButton.classList.toggle('hidden', window.scrollY <= 300);
  });
}

// Boot
loadJobs();