// Mobile navigation
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
})();

// Form submission to /api/events/1/register
document.getElementById('alumniMeetForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const fullName = document.getElementById('amName').value.trim();
  const email = document.getElementById('amEmail').value.trim();
  const phone = document.getElementById('amPhone').value.trim();
  const year = document.getElementById('amYear').value;
  const dept = document.getElementById('amDept').value;
  const userMsg = document.getElementById('amMsg').value.trim();

  const msgBox = document.getElementById('amStatusMsg');
  const btn = document.getElementById('amSubmitBtn');

  const combinedMessage = [
    year ? Batch:   '',
    dept ? Dept:   '',
    userMsg ? Note:   '',
  ].filter(Boolean).join(' | ');

  btn.disabled = true;
  btn.textContent = 'Registering…';

  try {
    const res = await fetch('/api/events/1/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, phone, message: combinedMessage }),
    });
    const data = await res.json();
    if (!res.ok) {
      msgBox.textContent = data.message || 'Registration failed.';
      msgBox.className = 'text-sm font-medium mb-3 text-red-600';
      return;
    }
    msgBox.textContent = '✅ You have registered successfully for the Annual Alumni Meet!';
    msgBox.className = 'text-sm font-medium mb-3 text-green-600';
    this.reset();
  } catch (err) {
    console.error(err);
    msgBox.textContent = 'Could not reach server. Please try again.';
    msgBox.className = 'text-sm font-medium mb-3 text-red-600';
  } finally {
    btn.disabled = false;
    btn.textContent = '🎉 Register Now';
  }
});
