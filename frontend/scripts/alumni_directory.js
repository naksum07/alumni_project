const searchInput =
            document.getElementById(
                "searchInput"
            );
 
        // Cards are rendered dynamically once alumni register, so we
        // re-query the live DOM on every search instead of caching a
        // snapshot from page load (there are none at load time).
        function getAlumniCards() {
            return document.querySelectorAll(".alumni-card");
        }
 
        const resultCount =
            document.getElementById(
                "resultCount"
            );
 
        const noResults =
            document.getElementById(
                "noResults"
            );
 
        const emptyState =
            document.getElementById(
                "emptyState"
            );
 
        const clearSearch =
            document.getElementById(
                "clearSearch"
            );
 
        const clearSearchText =
            document.getElementById(
                "clearSearchText"
            );
 
 
        searchInput.addEventListener(
            "input",
            function () {
 
                const alumniCards = getAlumniCards();
 
                /* Nothing registered yet — keep the empty state up and
                   don't run a search against zero cards. */
                if (alumniCards.length === 0) {
 
                    emptyState.classList.remove("hidden");
                    noResults.classList.add("hidden");
                    resultCount.textContent = "Showing 0 alumni";
                    return;
 
                }
 
                const searchTerm =
                    searchInput.value
                        .toLowerCase()
                        .trim();
 
 
                let visibleCount = 0;
 
 
                alumniCards.forEach(
                    function (card) {
 
                        const searchableText =
                            card.dataset.search
                                .toLowerCase();
 
 
                        if (
                            searchableText.includes(
                                searchTerm
                            )
                        ) {
 
                            card.classList.remove(
                                "hidden"
                            );
 
                            visibleCount++;
 
                        } else {
 
                            card.classList.add(
                                "hidden"
                            );
 
                        }
 
                    }
                );
 
 
                /* RESULT COUNT */
 
                resultCount.textContent =
                    `Showing ${visibleCount} alumni`;
 
 
                /* NO RESULTS (i.e. search matched nothing, though
                   alumni do exist in the directory) */
 
                if (visibleCount === 0) {
 
                    noResults.classList.remove(
                        "hidden"
                    );
 
                } else {
 
                    noResults.classList.add(
                        "hidden"
                    );
 
                }
 
 
                /* CLEAR BUTTON */
 
                if (searchTerm.length > 0) {
 
                    clearSearch.classList.remove(
                        "hidden"
                    );
 
                    clearSearchText.classList.remove(
                        "hidden"
                    );
 
                } else {
 
                    clearSearch.classList.add(
                        "hidden"
                    );
 
                    clearSearchText.classList.add(
                        "hidden"
                    );
 
                }
 
            }
        );
 
 
         // CLEAR SEARCH FUNCTION
 
        function clearSearchBox() {
 
            searchInput.value = "";
 
            const alumniCards = getAlumniCards();
 
            alumniCards.forEach(
                function (card) {
 
                    card.classList.remove(
                        "hidden"
                    );
 
                }
            );
 
 
            resultCount.textContent =
                alumniCards.length === 0
                    ? "Showing 0 alumni"
                    : `Showing ${alumniCards.length} alumni`;
 
 
            if (alumniCards.length === 0) {
 
                emptyState.classList.remove("hidden");
 
            }
 
 
            noResults.classList.add(
                "hidden"
            );
 
 
            clearSearch.classList.add(
                "hidden"
            );
 
 
            clearSearchText.classList.add(
                "hidden"
            );
 
 
            searchInput.focus();
 
        }
 
 
        clearSearch.addEventListener(
            "click",
            clearSearchBox
        );
 
 
        clearSearchText.addEventListener(
            "click",
            clearSearchBox
        );
 
 
        //CONTACT
 
        function contactMessage() {
 
            alert(
                "Thank you for contacting the Alumni Office!"
            );
 
        }
 
 
        /*
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
 
 
        /*SCROLL TO TOP*/
 
        function scrollToTop() {
 
            window.scrollTo({
 
                top: 0,
 
                behavior: "smooth"
 
            });
 
        }
(function () {
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || 'null');
  const navAuth       = document.getElementById('navAuth');
  const mobileNavAuth = document.getElementById('mobileNavAuth');
 
  if (token && user) {
    //LOGGED IN — show profile info
    const firstName = (user.fullName || user.full_name || 'You').split(' ')[0];
 
    navAuth.innerHTML = `
      <span class="text-blue-200 font-medium">Hi, <strong class="text-yellow-300">${firstName}</strong></span>
      <a href="my-profile.html"
         class="border border-white px-4 py-2 rounded-lg hover:bg-white hover:text-blue-900 transition text-sm">
        👤 My Profile
      </a>
      <button id="logoutBtn"
         class="bg-yellow-400 text-blue-900 font-semibold px-4 py-2 rounded-lg hover:bg-yellow-300 transition text-sm">
        Logout
      </button>`;
 
    mobileNavAuth.innerHTML = `
      <p class="text-blue-200 text-sm py-1">Logged in as <strong class="text-yellow-300">${firstName}</strong></p>
      <a href="my-profile.html"
         class="block text-center border border-white py-2 rounded-lg hover:bg-white hover:text-blue-900 transition">
        👤 My Profile
      </a>
      <button id="mobileLogoutBtn"
         class="w-full text-center bg-yellow-400 text-blue-900 py-2 rounded-lg font-semibold">
        Logout
      </button>`;
 
    function doLogout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    document.getElementById('logoutBtn').addEventListener('click', doLogout);
    document.getElementById('mobileLogoutBtn').addEventListener('click', doLogout);
 
  } else {
    // ---- NOT LOGGED IN — show Login / Register (page still works fine) ----
    navAuth.innerHTML = `
      <a href="login.html"
         class="border border-white px-5 py-2 rounded-lg hover:bg-white hover:text-blue-900 transition">
        Login
      </a>
      <a href="register.html"
         class="bg-yellow-400 text-blue-900 font-semibold px-5 py-2 rounded-lg hover:bg-yellow-300 transition">
        Register
      </a>`;
 
    mobileNavAuth.innerHTML = `
      <a href="login.html"
         class="block text-center border border-white py-2 rounded-lg hover:bg-white hover:text-blue-900 transition">
        Login
      </a>
      <a href="register.html"
         class="block text-center bg-yellow-400 text-blue-900 py-2 rounded-lg font-semibold">
        Register
      </a>`;
 
    sessionStorage.setItem('returnTo', 'alumni-directory.html');
  }
 
  // Mobile hamburger toggle
  const menuBtn    = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
 
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
 
  // Close mobile menu automatically if window is resized to desktop width
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
      mobileMenu.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.innerHTML = '☰';
    }
  });
 
  //Alumni directory data loading (unrelated to auth/nav)
  const alumniGrid = document.getElementById('alumniGrid');
  const resultCount = document.getElementById('resultCount');
  const emptyState = document.getElementById('emptyState');
 
  // Single source of truth for what the grid looks like — always call
  // this with the final alumni list (even an empty one) so "empty" and
  // "has data" can never both end up showing at once.
  function renderAlumniState(alumni) {
    const list = Array.isArray(alumni) ? alumni : [];
 
    if (list.length === 0) {
      if (alumniGrid) alumniGrid.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      if (resultCount) resultCount.textContent = 'Showing 0 alumni';
      return;
    }
 
    if (emptyState) emptyState.classList.add('hidden');
    if (resultCount) resultCount.textContent = `Showing ${list.length} alumni`;
 
    if (alumniGrid) {
      alumniGrid.innerHTML = list.map(a => {
        const initial = (a.full_name || '?').charAt(0).toUpperCase();
        return `
          <div class="alumni-card bg-white rounded-xl shadow-md p-6 text-center border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition"
               data-search="${(a.full_name || '').toLowerCase()} ${(a.job_title || '').toLowerCase()} ${(a.department || '').toLowerCase()} ${(a.company || '').toLowerCase()}">
            <div class="w-20 h-20 mx-auto rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-3xl font-bold">
              ${initial}
            </div>
            <h3 class="text-xl font-bold mt-5">${a.full_name}</h3>
            <p class="text-blue-700 mt-1 font-medium">${a.job_title || 'Alumni'}</p>
            <p class="text-gray-500 text-sm mt-2">${a.department || 'Department'} ${a.graduation_year ? `• Batch ${a.graduation_year}` : ''}</p>
            <p class="text-gray-500 text-sm mt-1">${a.company || 'AlumniConnect'}</p>
            <a href="my-profile.html" class="block mt-5 bg-blue-700 text-white py-2.5 rounded-lg hover:bg-blue-800 transition">
              View Profile
            </a>
          </div>
        `;
      }).join('');
    }
  }
 
  async function loadLiveAlumni(search = '') {
    const apiOrigin = window.location.protocol === 'file:' ? 'http://localhost:5001' : window.location.origin;
    const url = apiOrigin + '/api/alumni' + (search ? `?search=${encodeURIComponent(search)}` : '');
    const headers = token ? { 'Authorization': 'Bearer ' + token } : {};

    try {
      const res = await fetch(url, { headers });
 
      if (!res.ok) {
        console.warn('Alumni fetch failed with status', res.status);
        renderAlumniState([]);
        return;
      }
 
      const alumni = await res.json();
      renderAlumniState(alumni);
 
    } catch (e) {
      console.warn('Could not load alumni:', e);
      renderAlumniState([]);
    }
  }
 
  loadLiveAlumni();
})();
 