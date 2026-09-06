// Shared Global Navigation & Auth Bar Handler
window.getApiUrl = function(endpoint) {
    if (!endpoint) return '';
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) return endpoint;
    const path = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (window.location.protocol === 'file:') {
        return `http://localhost:5001${path}`;
    }
    if (isLocal && window.location.port && window.location.port !== '5001') {
        return `http://localhost:5001${path}`;
    }
    return path;
};

(function () {
  function initNav() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const navAuth = document.getElementById('navAuth');
    const mobileNavAuth = document.getElementById('mobileNavAuth');

    const currentPath = window.location.pathname;
    const isProfilePage = currentPath.endsWith('my-profile.html');
    const isInSubfolder = currentPath.includes('/community-blog/') || currentPath.includes('/pages/community-blog/');
    const pagePrefix = isInSubfolder ? '../' : '';
    const adminPrefix = isInSubfolder ? '../../admin/' : '../admin/';

    const profileUrl = `${pagePrefix}my-profile.html`;
    const loginUrl = `${pagePrefix}login.html`;
    const adminLoginUrl = `${adminPrefix}login.html`;

    if (token && user) {
      const rawName = user.fullName || user.full_name || user.name || 'You';
      const firstName = rawName.trim().split(' ')[0] || 'You';

      if (navAuth) {
        navAuth.innerHTML = `
          <span class="text-slate-700 font-medium text-sm">Hi, <strong class="text-[#012970]">${escapeHTML(firstName)}</strong></span>
          <a href="${profileUrl}"
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
          <a href="${profileUrl}"
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
          window.location.href = loginUrl;
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
          <a href="${adminLoginUrl}"
             class="text-slate-500 font-medium hover:text-[#012970] transition text-sm px-2 border-r border-gray-200 pr-4">
            Admin Login
          </a>
          <a href="${loginUrl}"
             class="bg-[#c4161c] hover:bg-[#a01217] text-white font-semibold px-5 py-2 rounded-lg transition text-sm shadow-sm">
            Login / Register
          </a>`;
      }

      if (mobileNavAuth) {
        mobileNavAuth.innerHTML = `
          <a href="${adminLoginUrl}"
             class="block text-center text-slate-500 py-2 rounded-lg font-medium hover:bg-gray-100 transition text-sm border-b border-gray-200 pb-3 mb-3">
            Admin Login
          </a>
          <div class="space-y-2">
            <a href="${loginUrl}"
               class="block text-center bg-[#c4161c] hover:bg-[#a01217] text-white py-2 rounded-lg font-semibold text-sm transition">
              Login / Register
            </a>
          </div>`;
      }
    }

    // Mobile menu toggle
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    window.toggleMobileMenu = function(e) {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      const mobMenu = document.getElementById('mobileMenu');
      const mBtn = document.getElementById('menuBtn');
      if (mobMenu) {
        mobMenu.classList.toggle('hidden');
        const isOpen = !mobMenu.classList.contains('hidden');
        if (mBtn) {
          mBtn.setAttribute('aria-expanded', isOpen);
          mBtn.innerHTML = isOpen ? '✕' : '☰';
        }
      }
    };

    if (menuBtn && mobileMenu && !menuBtn.dataset.bound) {
      menuBtn.dataset.bound = "true";
      menuBtn.addEventListener('click', (e) => {
        // Handled by toggleMobileMenu or direct toggle
        window.toggleMobileMenu(e);
      });

      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobileMenu.classList.add('hidden');
          if (menuBtn) {
            menuBtn.setAttribute('aria-expanded', 'false');
            menuBtn.innerHTML = '☰';
          }
        });
      });

      window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
          mobileMenu.classList.add('hidden');
          if (menuBtn) {
            menuBtn.setAttribute('aria-expanded', 'false');
            menuBtn.innerHTML = '☰';
          }
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
