/* =========================================================
   NETWORKING — Backend API wiring (auth guard + user name)
   ========================================================= */
(function () {
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || 'null');
  if (!token || !user) { window.location.href = 'login.html'; return; }

  document.querySelectorAll('[data-user-name]').forEach(el => {
    el.textContent = user.fullName || user.email;
  });

  document.querySelectorAll('[data-logout]').forEach(btn => {
    btn.addEventListener('click', function () {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
    });
  });
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
})();

    // UI behavior that used to come free from networking.css
    // (.modal{display:none}, .filter.active{...}) — now handled
    // explicitly since that stylesheet has been removed.
     //Safe to delete if networking.js already does this.
     
(function () {
  // Connect modal open/close
  const modal = document.getElementById('connectModal');
  const closeBtn = modal ? modal.querySelector('.close') : null;

  document.querySelectorAll('.connect-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    });
  }

  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    });
  }

  // Active filter highlight
  const filters = document.querySelectorAll('.filter');
  filters.forEach(function (f) {
    f.addEventListener('click', function () {
      filters.forEach(function (x) {
        x.classList.remove('active', 'bg-[#0D6EFD]', 'text-white');
        x.classList.add('bg-white', 'text-[#0D6EFD]');
      });
      f.classList.add('active', 'bg-[#0D6EFD]', 'text-white');
      f.classList.remove('bg-white', 'text-[#0D6EFD]');
    });
  });
})();
// SEARCH FUNCTION

const searchInput = document.getElementById("searchInput");
const cards = document.querySelectorAll(".alumni-card");

searchInput.addEventListener("keyup", function () {

    let value = searchInput.value.toLowerCase();

    cards.forEach(card => {

        let text = card.innerText.toLowerCase();

        if (text.includes(value)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }

    });

});

// FILTER BUTTONS

const filters = document.querySelectorAll(".filter");

filters.forEach(button => {

    button.addEventListener("click", function () {

        filters.forEach(btn => btn.classList.remove("active"));

        this.classList.add("active");

        const category = this.innerText.toLowerCase();

        cards.forEach(card => {

            if (category === "all") {

                card.style.display = "block";

            } else {

                const cardCategory = card.dataset.category.toLowerCase();

                if (cardCategory === category) {

                    card.style.display = "block";

                } else {

                    card.style.display = "none";

                }

            }

        });

    });

});

// CONNECT MODAL

const modal = document.getElementById("connectModal");

const connectButtons = document.querySelectorAll(".connect-btn");

const closeBtn = document.querySelector(".close");

connectButtons.forEach(button => {

    button.addEventListener("click", () => {

        modal.style.display = "flex";

    });

});

closeBtn.addEventListener("click", () => {

    modal.style.display = "none";

});

window.addEventListener("click", function (e) {

    if (e.target === modal) {

        modal.style.display = "none";

    }

});


// CONNECT FORM

const form = document.getElementById("connectForm");

form.addEventListener("submit", function (e) {

    e.preventDefault();

    alert("🎉 Connection Request Sent Successfully!");

    form.reset();

    modal.style.display = "none";

});

// CARD HOVER EFFECT

cards.forEach(card => {

    card.addEventListener("mouseenter", () => {

        card.style.transition = ".3s";

    });

});

// SMOOTH SCROLL

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute("href")).scrollIntoView({
            behavior: "smooth"
        });
    });
});