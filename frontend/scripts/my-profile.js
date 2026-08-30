// Profile API & Data Population
    (function () {
      const token = localStorage.getItem('token');
      const user  = JSON.parse(localStorage.getItem('user') || 'null');

      if (!token || !user) {
        window.location.href = 'login.html';
        return;
      }

      function fill(selector, value) {
        document.querySelectorAll(selector).forEach(el => {
          if (value !== undefined && value !== null && value !== '') {
            el.textContent = value;
          }
        });
      }

      const name = user.fullName || user.full_name || 'Member';
      fill('[data-user-name]', name);
      fill('[data-user-email]', user.email);
      fill('[data-user-role]', user.role);
      if (user.phone) fill('[data-user-phone]', user.phone);
      if (user.department) fill('[data-user-dept]', user.department);
      if (user.graduation_year || user.graduationYear) fill('[data-user-year]', user.graduation_year || user.graduationYear);
      if (user.job_title || user.current_role) fill('[data-user-current-role]', user.job_title || user.current_role);
      if (user.company) fill('[data-user-company]', user.company);

      const avatar = document.getElementById('profileAvatarInitial');
      if (avatar && name) {
        avatar.textContent = name.charAt(0).toUpperCase();
      }

      // Logout handler
      document.querySelectorAll('[data-logout]').forEach(btn => {
        btn.addEventListener('click', function () {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = 'login.html';
        });
      });

      // Mobile Menu
      const menuBtn = document.getElementById('menuBtn');
      const mobileMenu = document.getElementById('mobileMenu');
      if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', function () {
          mobileMenu.classList.toggle('hidden');
          const isOpen = !mobileMenu.classList.contains('hidden');
          menuBtn.setAttribute('aria-expanded', isOpen);
          menuBtn.innerHTML = isOpen ? '&#10005;' : '&#9776;';
        });
      }
    })();