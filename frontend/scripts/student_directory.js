(function () {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const navAuth = document.getElementById('navAuth');
  const mobileNavAuth = document.getElementById('mobileNavAuth');

  if (token && user) {
    const firstName = (user.fullName || user.full_name || 'You').split(' ')[0];
    if (navAuth) {
      navAuth.innerHTML = `
        <span class="text-slate-700 font-medium text-sm">Hi, <strong class="text-[#012970]">${firstName}</strong></span>
        <a href="my-profile.html" class="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:border-[#012970] hover:text-[#012970] transition text-sm">👤 My Profile</a>
        <button id="logoutBtn" class="bg-[#c4161c] hover:bg-[#a01217] text-white font-semibold px-4 py-2 rounded-lg transition text-sm shadow-sm">Logout</button>`;
    }
    if (mobileNavAuth) {
      mobileNavAuth.innerHTML = `
        <p class="text-slate-700 text-sm py-1">Logged in as <strong class="text-[#012970]">${firstName}</strong></p>
        <a href="my-profile.html" class="block text-center border border-slate-300 text-slate-700 py-2 rounded-lg hover:border-[#012970] hover:text-[#012970] transition text-sm">👤 My Profile</a>
        <button id="mobileLogoutBtn" class="w-full text-center bg-[#c4161c] hover:bg-[#a01217] text-white py-2 rounded-lg font-semibold text-sm transition">Logout</button>`;
    }

    function doLogout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    const logoutBtn = document.getElementById('logoutBtn');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', doLogout);
    if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', doLogout);
  } else {
    if (navAuth) {
      navAuth.innerHTML = `
        <a href="../admin/login.html" class="text-slate-500 font-medium hover:text-[#012970] transition text-sm px-2 border-r border-gray-200 pr-4">Admin Login</a>
        <a href="login.html" class="bg-[#c4161c] hover:bg-[#a01217] text-white font-semibold px-5 py-2 rounded-lg transition text-sm shadow-sm">Login / Register</a>`;
    }
    if (mobileNavAuth) {
      mobileNavAuth.innerHTML = `
        <a href="../admin/login.html" class="block text-center text-slate-500 py-2 rounded-lg font-medium hover:bg-gray-100 transition text-sm border-b border-gray-200 pb-3 mb-3">Admin Login</a>
        <div class="space-y-2"><a href="login.html" class="block text-center bg-[#c4161c] hover:bg-[#a01217] text-white py-2 rounded-lg font-semibold text-sm transition">Login / Register</a></div>`;
    }
    sessionStorage.setItem('returnTo', 'student-directory.html');
  }

  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
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

  // --- Search and Pagination ---
  const searchInput = document.getElementById("searchInput");
  const resultCount = document.getElementById("resultCount");
  const noResults = document.getElementById("noResults");
  const emptyState = document.getElementById("emptyState");
  const clearSearch = document.getElementById("clearSearch");
  const clearSearchText = document.getElementById("clearSearchText");
  const studentGrid = document.getElementById("studentGrid");

  let allStudents = [];
  let filteredStudents = [];
  let currentPage = 1;
  const itemsPerPage = 40;

  function updatePaginationControls() {
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const pageIndicator = document.getElementById('pageIndicator');
    const paginationControls = document.getElementById('paginationControls');

    if (filteredStudents.length <= itemsPerPage) {
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
    if (filteredStudents.length === 0) {
      if (studentGrid) studentGrid.innerHTML = '';
      if (allStudents.length === 0) {
        if (emptyState) emptyState.classList.remove("hidden");
        if (noResults) noResults.classList.add("hidden");
      } else {
        if (emptyState) emptyState.classList.add("hidden");
        if (noResults) noResults.classList.remove("hidden");
      }
      if (resultCount) resultCount.textContent = "Showing 0 students";
      updatePaginationControls();
      return;
    }

    if (emptyState) emptyState.classList.add("hidden");
    if (noResults) noResults.classList.add("hidden");
    if (resultCount) resultCount.textContent = `Showing ${filteredStudents.length} student${filteredStudents.length === 1 ? '' : 's'}`;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const pageData = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

    if (studentGrid) {
      studentGrid.innerHTML = pageData.map(s => {
        const initial = (s.full_name || '?').charAt(0).toUpperCase();
        return `
          <div class="student-card bg-white rounded-xl shadow-md p-6 text-center border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition">
            <div class="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl font-bold">
              ${initial}
            </div>
            <h3 class="text-xl font-bold mt-5 text-gray-900">${s.full_name}</h3>
            <span class="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Student</span>
            <p class="text-gray-500 text-sm mt-2">${s.department || 'Department'} ${s.graduation_year ? `• Batch ${s.graduation_year}` : ''}</p>
            <p class="text-gray-400 text-xs mt-1">The ICFAI University, Sikkim</p>
            <a href="my-profile.html?id=${s.id}" class="block mt-5 bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-lg font-medium transition">
              View Profile
            </a>
          </div>
        `;
      }).join('');
    }
    updatePaginationControls();
  }

  function applyFilters() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    filteredStudents = allStudents.filter(s => {
      const searchableText = `${s.full_name || ''} ${s.department || ''} ${s.graduation_year || ''}`.toLowerCase();
      return searchableText.includes(searchTerm);
    });

    if (searchTerm.length > 0) {
      if (clearSearch) clearSearch.classList.remove("hidden");
      if (clearSearchText) clearSearchText.classList.remove("hidden");
    } else {
      if (clearSearch) clearSearch.classList.add("hidden");
      if (clearSearchText) clearSearchText.classList.add("hidden");
    }

    currentPage = 1;
    renderCurrentPage();
  }

  if (searchInput) searchInput.addEventListener("input", applyFilters);

  function clearSearchBox() {
    if (searchInput) searchInput.value = "";
    applyFilters();
    if (searchInput) searchInput.focus();
  }
  if (clearSearch) clearSearch.addEventListener("click", clearSearchBox);
  if (clearSearchText) clearSearchText.addEventListener("click", clearSearchBox);

  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');
  if (prevBtn) prevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderCurrentPage(); } });
  if (nextBtn) nextBtn.addEventListener('click', () => { 
      const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
      if (currentPage < totalPages) { currentPage++; renderCurrentPage(); } 
  });

  async function loadLiveStudents() {
    const apiOrigin = window.location.protocol === 'file:' ? 'http://localhost:5001' : window.location.origin;
    const url = apiOrigin + '/api/students';
    const headers = token ? { 'Authorization': 'Bearer ' + token } : {};

    try {
      const res = await fetch(url, { headers });
      if (!res.ok) {
        console.warn('Students fetch failed with status', res.status);
        return;
      }
      allStudents = await res.json();
      applyFilters();
    } catch (e) {
      console.warn('Could not load students:', e);
    }
  }

  const initialStudentSearch = new URLSearchParams(window.location.search).get('search') || '';
  if (initialStudentSearch && searchInput) searchInput.value = initialStudentSearch;
  
  loadLiveStudents();

})();
