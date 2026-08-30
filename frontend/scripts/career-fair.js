// Mobile navigation toggle
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

// Career Fair Registration Form Submission
document.getElementById('careerFairForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const fullName = document.getElementById('cfName').value.trim();
  const email = document.getElementById('cfEmail').value.trim();
  const phone = document.getElementById('cfPhone').value.trim();
  const qual = document.getElementById('cfQualification').value;
  const dept = document.getElementById('cfDept').value;
  const skills = document.getElementById('cfSkills').value.trim();
  const company = document.getElementById('cfCompany').value.trim();
  const userMsg = document.getElementById('cfMessage').value.trim();

  const msgBox = document.getElementById('cfStatusMsg');
  const btn = document.getElementById('cfSubmitBtn');

  const combinedMessage = [
    qual ? `Qualification: ${qual}` : '',
    dept ? `Dept: ${dept}` : '',
    skills ? `Skills: ${skills}` : '',
    company ? `Preferred Company: ${company}` : '',
    userMsg ? `Note: ${userMsg}` : '',
  ].filter(Boolean).join(' | ');

  btn.disabled = true;
  btn.textContent = 'Registering…';

  try {
    // Career Fair is event id 2 in standard seed data
    const res = await fetch('/api/events/2/register', {
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
    msgBox.textContent = '✅ You have registered successfully for the Career Fair!';
    msgBox.className = 'text-sm font-medium mb-3 text-green-600';
    this.reset();
  } catch (err) {
    console.error(err);
    msgBox.textContent = 'Could not reach server. Please try again.';
    msgBox.className = 'text-sm font-medium mb-3 text-red-600';
  } finally {
    btn.disabled = false;
    btn.textContent = '🚀 Register Now';
  }
});

