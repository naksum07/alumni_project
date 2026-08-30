/* ================================================
           MOBILE MENU
        ================================================= */

        const menuBtn =
            document.getElementById("menuBtn");

        const mobileMenu =
            document.getElementById("mobileMenu");

        const menuIcon =
            document.getElementById("menuIcon");


        menuBtn.addEventListener(
            "click",
            function () {

                mobileMenu.classList.toggle("hidden");


                if (
                    mobileMenu.classList.contains("hidden")
                ) {

                    menuIcon.classList.remove(
                        "fa-xmark"
                    );

                    menuIcon.classList.add(
                        "fa-bars"
                    );

                } else {

                    menuIcon.classList.remove(
                        "fa-bars"
                    );

                    menuIcon.classList.add(
                        "fa-xmark"
                    );

                }

            }
        );


        /* ================================================
           CLOSE MOBILE MENU AFTER CLICK
        ================================================= */

        document
            .querySelectorAll(".mobile-link")
            .forEach(function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        mobileMenu.classList.add(
                            "hidden"
                        );

                        menuIcon.classList.remove(
                            "fa-xmark"
                        );

                        menuIcon.classList.add(
                            "fa-bars"
                        );

                    }
                );

            });


        /* ================================================
           CONTACT
        ================================================= */

        function contactMessage() {

            alert(
                "Thank you for contacting the Alumni Office!"
            );

        }


        /* ================================================
           SCROLL TO TOP BUTTON
        ================================================= */

        const scrollTopBtn =
            document.getElementById(
                "scrollTopBtn"
            );


        window.addEventListener(
            "scroll",
            function () {

                if (window.scrollY > 300) {

                    scrollTopBtn.classList.remove(
                        "hidden"
                    );

                } else {

                    scrollTopBtn.classList.add(
                        "hidden"
                    );

                }

            }
        );


        /* ================================================
           SCROLL TO TOP
        ================================================= */

        function scrollToTop() {

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }


        /* ================================================
           CLOSE MOBILE MENU ON RESIZE
        ================================================= */

        window.addEventListener(
            "resize",
            function () {

                if (window.innerWidth >= 768) {

                    mobileMenu.classList.add(
                        "hidden"
                    );

                    menuIcon.classList.remove(
                        "fa-xmark"
                    );

                    menuIcon.classList.add(
                        "fa-bars"
                    );

                }

            }
        );

/* =========================================================
   DASHBOARD — Backend API wiring
   Reads the logged-in user from localStorage (set by login.html)
   and populates the welcome message and stats.
   Redirects to login if no token is found.
   ========================================================= */
(function () {
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || 'null');

  // Guard — send unauthenticated visitors to the login page
  if (!token || !user) {
    window.location.href = 'login.html';
    return;
  }

  // Populate greeting elements if they exist on the page
  document.querySelectorAll('[data-user-name]').forEach(el => {
    el.textContent = user.fullName || user.email;
  });
  document.querySelectorAll('[data-user-role]').forEach(el => {
    el.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  });

  // Logout buttons
  document.querySelectorAll('[data-logout]').forEach(btn => {
    btn.addEventListener('click', function () {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
    });
  });

  // Load alumni count for the stat card (requires token)
  fetch('/api/alumni', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
  .then(r => r.ok ? r.json() : [])
  .then(alumni => {
    const el = document.getElementById('alumniCount');
    if (el) el.textContent = alumni.length;
  })
  .catch(() => {});
})();


(function () {
  const btn  = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', function () {
    menu.classList.toggle('hidden');
    const open = !menu.classList.contains('hidden');
    btn.setAttribute('aria-expanded', open);
    btn.innerHTML = open ? '&#10005;' : '&#9776;';
  });
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      menu.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = '&#9776;';
    });
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768) {
      menu.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = '&#9776;';
    }
  });

// element references 
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
// Format "2026-08-15" → "15 August 2026"
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Show / hide the registration modal
function openRegistrationModal(eventId, eventName) {
  regEventId.value    = eventId;
  regEventName.textContent = eventName;
  regMessage.textContent   = '';
  regMessage.className     = 'text-sm font-medium mt-3 hidden';
  regForm.reset();
  regModal.classList.remove('hidden');
  regModal.classList.add('flex');
}

function closeRegistrationModal() {
  regModal.classList.add('hidden');
  regModal.classList.remove('flex');
}

// Show inline feedback inside the modal
function showRegMessage(text, isError) {
  regMessage.textContent = text;
  regMessage.classList.remove('hidden', 'text-red-600', 'text-green-600');
  regMessage.classList.add(isError ? 'text-red-600' : 'text-green-600');
}

function renderEvents(events) {
  eventsContainer.innerHTML = '';
  if (events.length === 0) {
    eventsContainer.innerHTML = `
      <div class="col-span-3 text-center py-16 text-gray-500">
        <i class="fa-solid fa-calendar-xmark text-5xl mb-4 block"></i>
        No upcoming events at the moment. Check back soon!
      </div>`;
    return;
  }
  events.forEach((event, index) => {
    const palette = PALETTES[index % PALETTES.length];
    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl shadow-md overflow-hidden hover:-translate-y-2 hover:shadow-xl transition-all duration-300';
    card.innerHTML = `
      <div class="${palette.bg} text-white p-6">
        <i class="fa-solid ${palette.icon} text-4xl"></i>
        <p class="mt-4 font-semibold">${formatDate(event.event_date)}</p>
        ${event.event_time ? `<p class="text-sm opacity-80 mt-1">${event.event_time}</p>` : ''}
      </div>
      <div class="p-6">
        <h2 class="text-2xl font-bold">${event.name}</h2>
        <p class="text-gray-600 mt-3">${event.description || ''}</p>
        ${event.venue ? `<p class="text-gray-500 mt-4"><i class="fa-solid fa-location-dot mr-2"></i>${event.venue}</p>` : ''}
        <button
          onclick="openRegistrationModal(${event.id}, '${event.name.replace(/'/g, "\\'")}')"
          class="w-full bg-blue-700 text-white py-3 rounded-lg mt-6 hover:bg-blue-800 transition font-semibold">
          Register Now
        </button>
      </div>`;
    eventsContainer.appendChild(card);
  });
}

//Fetch Events from API
async function loadEvents() {
  eventsContainer.innerHTML = `
    <div class="col-span-3 text-center py-16 text-gray-400">
      <i class="fa-solid fa-spinner fa-spin text-4xl mb-4 block"></i>
      Loading events…
    </div>`;
  try {
    const res = await fetch('/api/events');
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const events = await res.json();
    renderEvents(events);
  } catch (err) {
    console.error('Failed to load events:', err);
    eventsContainer.innerHTML = `
      <div class="col-span-3 text-center py-16 text-red-500">
        <i class="fa-solid fa-circle-exclamation text-4xl mb-4 block"></i>
        Could not load events. Please refresh the page or try again later.
      </div>`;
  }
}

regForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  const eventId  = regEventId.value;
  const fullName = document.getElementById('regName').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const phone    = document.getElementById('regPhone').value.trim();
  const message  = document.getElementById('regMsgText').value.trim();
  const submitBtn = regForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Registering…';
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
    submitBtn.disabled = false;
    submitBtn.textContent = 'Register';
  }
});

regModal.addEventListener('click', function (e) {
  if (e.target === regModal) closeRegistrationModal();
});

const scrollTopBtn = document.getElementById('scrollTopBtn');

if (scrollTopBtn) {
  window.addEventListener('scroll', function () {
    scrollTopBtn.classList.toggle('hidden', window.scrollY <= 300);
  });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

//boot
loadEvents();
})();