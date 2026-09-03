(function () {
const eventsContainer = document.getElementById('eventsContainer');
const regModal        = document.getElementById('regModal');
const regForm         = document.getElementById('regForm');
const regEventName    = document.getElementById('regEventName');
const regMessage      = document.getElementById('regMessage');
const regEventId      = document.getElementById('regEventId');

const PALETTES = [
  { bg: 'bg-blue-700',   icon: 'fa-users' },
  { bg: 'bg-purple-700', icon: 'fa-laptop-code' },
  { bg: 'bg-green-700',  icon: 'fa-briefcase' },
  { bg: 'bg-orange-600', icon: 'fa-robot' },
  { bg: 'bg-pink-600',   icon: 'fa-comments' },
  { bg: 'bg-red-600',    icon: 'fa-graduation-cap' },
];

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function openRegistrationModal(eventId, eventName) {
  if (regEventId) regEventId.value = eventId;
  if (regEventName) regEventName.textContent = eventName;
  if (regMessage) {
      regMessage.textContent = '';
      regMessage.className = 'text-sm font-medium mt-3 hidden';
  }
  if (regForm) regForm.reset();

  const countrySelect = document.getElementById('regCountryCode');
  const phoneInput = document.getElementById('regPhone');
  if (countrySelect && phoneInput) {
    countrySelect.value = '+91';
    phoneInput.placeholder = '98765 43210';
  }

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user) {
    const rawName = user.fullName || user.full_name || '';
    const parts = rawName.split(' ');
    if (parts.length === 1) {
      if (document.getElementById('regFirstName')) document.getElementById('regFirstName').value = parts[0] || '';
    } else if (parts.length === 2) {
      if (document.getElementById('regFirstName')) document.getElementById('regFirstName').value = parts[0] || '';
      if (document.getElementById('regLastName')) document.getElementById('regLastName').value = parts[1] || '';
    } else if (parts.length >= 3) {
      if (document.getElementById('regFirstName')) document.getElementById('regFirstName').value = parts[0] || '';
      if (document.getElementById('regMiddleName')) document.getElementById('regMiddleName').value = parts.slice(1, -1).join(' ') || '';
      if (document.getElementById('regLastName')) document.getElementById('regLastName').value = parts[parts.length - 1] || '';
    }
    if (user.email && document.getElementById('regEmail')) document.getElementById('regEmail').value = user.email;
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

  if (regModal) {
      regModal.classList.remove('hidden');
      regModal.classList.add('flex');
  }
}

const countrySelect = document.getElementById('regCountryCode');
const phoneInput = document.getElementById('regPhone');
if (countrySelect && phoneInput) {
  countrySelect.addEventListener('change', function() {
    const selectedOption = countrySelect.options[countrySelect.selectedIndex];
    const format = selectedOption.getAttribute('data-format');
    if (format) phoneInput.placeholder = format;
  });
}

function closeRegistrationModal() {
  if (regModal) {
      regModal.classList.add('hidden');
      regModal.classList.remove('flex');
  }
}

function showRegMessage(text, isError) {
  if (regMessage) {
      regMessage.textContent = text;
      regMessage.classList.remove('hidden', 'text-red-600', 'text-green-600');
      regMessage.classList.add(isError ? 'text-red-600' : 'text-green-600');
  }
}

// --- Pagination ---
let allEvents = [];
let currentPage = 1;
const itemsPerPage = 40;

function updatePaginationControls() {
    const totalPages = Math.ceil(allEvents.length / itemsPerPage) || 1;
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const pageIndicator = document.getElementById('pageIndicator');
    const paginationControls = document.getElementById('paginationControls');

    if (allEvents.length <= itemsPerPage) {
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

function renderCurrentPage() {
  if (!eventsContainer) return;
  eventsContainer.innerHTML = '';
  
  if (allEvents.length === 0) {
    eventsContainer.innerHTML = `
      <div class="col-span-3 text-center py-16 text-gray-500">
        <i class="fa-solid fa-calendar-xmark text-5xl mb-4 block"></i>
        No upcoming events at the moment. Check back soon!
      </div>`;
    updatePaginationControls();
    return;
  }
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageData = allEvents.slice(startIndex, startIndex + itemsPerPage);

  pageData.forEach((event, index) => {
    const palette = PALETTES[index % PALETTES.length];
    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl shadow-md overflow-hidden hover:-translate-y-2 hover:shadow-xl transition-all duration-300 border border-slate-100';

    let dateDisplay = formatDate(event.event_date);
    if (event.event_date_end) dateDisplay += ' – ' + formatDate(event.event_date_end);

    card.innerHTML = `
      <div class="${palette.bg} text-white p-6">
        <i class="fa-solid ${palette.icon} text-4xl"></i>
        <p class="mt-4 font-semibold">${dateDisplay}</p>
        ${event.event_time ? `<p class="text-sm opacity-80 mt-1">${event.event_time}</p>` : ''}
      </div>
      <div class="p-6">
        <h2 class="text-2xl font-bold text-slate-800">${event.name}</h2>
        <p class="text-gray-600 mt-3 text-sm leading-relaxed">${event.description || ''}</p>
        ${event.venue ? `<p class="text-gray-500 mt-4 text-sm flex items-center gap-2"><i class="fa-solid fa-location-dot text-[#c4161c]"></i>${event.venue}</p>` : ''}
        <button class="reg-btn w-full bg-[#c4161c] hover:bg-[#a01217] text-white py-3 rounded-xl mt-6 transition font-semibold shadow-md">Register Now</button>
      </div>`;

    const regBtn = card.querySelector('.reg-btn');
    if (regBtn) regBtn.addEventListener('click', () => openRegistrationModal(event.id, event.name));
    eventsContainer.appendChild(card);
  });
  updatePaginationControls();
}

async function loadEvents() {
  if (eventsContainer) {
      eventsContainer.innerHTML = `
        <div class="col-span-3 text-center py-16 text-gray-400">
          <i class="fa-solid fa-spinner fa-spin text-4xl mb-4 block"></i>
          Loading events…
        </div>`;
  }
  try {
    const res = await fetch('/api/events');
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const events = await res.json();
    if (Array.isArray(events)) allEvents = events;
    renderCurrentPage();
  } catch (err) {
    console.error('Failed to load events:', err);
    if (eventsContainer) {
        eventsContainer.innerHTML = `
          <div class="col-span-3 text-center py-16 text-red-500">
            <i class="fa-solid fa-circle-exclamation text-4xl mb-4 block"></i>
            Could not load events. Please refresh the page or try again later.
          </div>`;
    }
  }
}

const prevBtn = document.getElementById('prevPageBtn');
const nextBtn = document.getElementById('nextPageBtn');
if (prevBtn) prevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderCurrentPage(); } });
if (nextBtn) nextBtn.addEventListener('click', () => { 
    const totalPages = Math.ceil(allEvents.length / itemsPerPage) || 1;
    if (currentPage < totalPages) { currentPage++; renderCurrentPage(); } 
});

if (regForm) {
    regForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const eventId   = regEventId.value;
      const firstName = document.getElementById('regFirstName').value.trim();
      const middleName = (document.getElementById('regMiddleName')?.value || '').trim();
      const lastName  = document.getElementById('regLastName').value.trim();
      const fullName  = [firstName, middleName, lastName].filter(Boolean).join(' ');

      const email     = document.getElementById('regEmail').value.trim();
      const countryCode = document.getElementById('regCountryCode')?.value || '+91';
      const rawPhone  = (document.getElementById('regPhone')?.value || '').trim();
      const phone     = rawPhone ? `${countryCode} ${rawPhone}` : '';
      const message   = document.getElementById('regMsgText').value.trim();

      const submitBtn = regForm.querySelector('button[type="submit"]');
      if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Registering…';
      }
      try {
        const res = await fetch(`/api/events/${eventId}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName, email, phone, message }),
        });
        const data = await res.json();
        if (!res.ok) {
          showRegMessage(data.message || 'Registration failed. Please try again.', true);
          return;
        }
        showRegMessage('✅ You have been registered successfully!', false);
        regForm.reset();

        setTimeout(closeRegistrationModal, 2000);
      } catch (err) {
        console.error('Registration error:', err);
        showRegMessage('Could not reach the server. Please try again later.', true);
      } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Register';
        }
      }
    });
}

if (regModal) {
    regModal.addEventListener('click', function (e) {
      if (e.target === regModal) closeRegistrationModal();
    });
}

const scrollTopBtn = document.getElementById('scrollTopBtn');
if (scrollTopBtn) {
  window.addEventListener('scroll', function () {
    if (window.scrollY <= 300) scrollTopBtn.classList.add('hidden');
    else scrollTopBtn.classList.remove('hidden');
  });
}
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

loadEvents();
window.openRegistrationModal = openRegistrationModal;
window.closeRegistrationModal = closeRegistrationModal;
window.scrollToTop = scrollToTop;
})();