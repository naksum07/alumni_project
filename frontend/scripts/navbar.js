// Shared Global Navigation & Auth Bar Handler
(function () {
  function initNav() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const navAuth = document.getElementById('navAuth');
    const mobileNavAuth = document.getElementById('mobileNavAuth');

    const currentPath = window.location.pathname;
    const isProfilePage = currentPath.endsWith('my-profile.html');

    if (token && user) {
      const rawName = user.fullName || user.full_name || user.name || 'You';
      const firstName = rawName.trim().split(' ')[0] || 'You';

      if (navAuth) {
        navAuth.innerHTML = `
          <span class="text-slate-700 font-medium text-sm">Hi, <strong class="text-[#012970]">${escapeHTML(firstName)}</strong></span>
          <a href="my-profile.html"
             class="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:border-[#012970] hover:text-[#012970] transition text-sm ${isProfilePage ? 'border-[#012970] text-[#012970] font-semibold' : ''}">
            👤 My Profile
          </a>
          <button id="logoutBtn"
             class="bg-[#c4161c] hover:bg-[#a01217] text-white font-semibold px-4 py-2 rounded-lg transition text-sm shadow-sm cursor-pointer">
            Logout
          </button>`;
      }

      if (mobileNavAuth) {
        mobileNavAuth.innerHTML = `
          <p class="text-slate-700 text-sm py-1">Logged in as <strong class="text-[#012970]">${escapeHTML(firstName)}</strong></p>
          <a href="my-profile.html"
             class="block text-center border border-slate-300 text-slate-700 py-2 rounded-lg hover:border-[#012970] hover:text-[#012970] transition text-sm ${isProfilePage ? 'border-[#012970] text-[#012970] font-semibold' : ''}">
            👤 My Profile
          </a>
          <button id="mobileLogoutBtn"
             class="w-full text-center bg-[#c4161c] hover:bg-[#a01217] text-white py-2 rounded-lg font-semibold text-sm transition cursor-pointer">
            Logout
          </button>`;
      }


      function doLogout(e) {
        if (e) e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (isProfilePage) {
          window.location.href = 'login.html';
        } else {
          window.location.reload();
        }
      }

      const logoutBtn = document.getElementById('logoutBtn');
      const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
      if (logoutBtn) logoutBtn.addEventListener('click', doLogout);
      if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', doLogout);

      document.querySelectorAll('[data-logout]').forEach(btn => {
        btn.addEventListener('click', doLogout);
      });

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

    // Mobile menu toggle
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (menuBtn && mobileMenu && !menuBtn.dataset.bound) {
      menuBtn.dataset.bound = "true";
      menuBtn.addEventListener('click', () => {
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

      window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
          mobileMenu.classList.add('hidden');
          menuBtn.setAttribute('aria-expanded', 'false');
          menuBtn.innerHTML = '☰';
        }
      });
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }
})();
