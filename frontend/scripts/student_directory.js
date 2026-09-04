// --- Search and Pagination ---
  const searchInput = document.getElementById("searchInput");
  const filterDepartment = document.getElementById("filterDepartment");
  const filterYear = document.getElementById("filterYear");
  const resultCount = document.getElementById("resultCount");
  const noResults = document.getElementById("noResults");
  const emptyState = document.getElementById("emptyState");
  const clearSearch = document.getElementById("clearSearch");
  const clearSearchText = document.getElementById("clearSearchText");
  const studentGrid = document.getElementById("studentGrid");

  let allStudents = [];
  let filteredStudents = [];
  let currentPage = 1;
  const itemsPerPage = 21;

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
          <div class="student-card bg-white rounded-xl shadow-md p-6 text-center border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition flex flex-col justify-between">
            <div>
              <div class="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl font-bold">
                ${initial}
              </div>
              <h3 class="text-xl font-bold mt-5 text-gray-900">${s.full_name}</h3>
              <span class="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Student</span>
              ${s.enrollment_number ? `<p class="text-gray-500 text-xs font-mono mt-1">Roll No: ${s.enrollment_number}</p>` : ''}
              <p class="text-gray-500 text-sm mt-2">${s.department || 'Department'} ${s.graduation_year ? `• Batch ${s.graduation_year}` : ''}</p>
              ${s.city ? `<p class="text-gray-500 text-xs mt-1 font-medium">📍 ${s.city}</p>` : ''}
              ${s.linkedin_url ? `
                <div class="mt-3">
                  <a href="${s.linkedin_url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-900 font-semibold bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full transition">
                    <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                    LinkedIn Profile
                  </a>
                </div>
              ` : ''}
            </div>
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
    const selectedDept = filterDepartment ? filterDepartment.value : '';
    const selectedYear = filterYear ? filterYear.value : '';

    filteredStudents = allStudents.filter(s => {
      const searchableText = `${s.full_name || ''} ${s.department || ''} ${s.graduation_year || ''} ${s.city || ''} ${s.enrollment_number || ''}`.toLowerCase();
      const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
      const matchesDept = !selectedDept || s.department === selectedDept;
      const matchesYear = !selectedYear || String(s.graduation_year) === String(selectedYear);
      return matchesSearch && matchesDept && matchesYear;
    });

    const isFiltered = searchTerm.length > 0 || selectedDept !== '' || selectedYear !== '';
    if (isFiltered) {
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
  if (filterDepartment) filterDepartment.addEventListener("change", applyFilters);
  if (filterYear) filterYear.addEventListener("change", applyFilters);

  function clearSearchBox() {
    if (searchInput) searchInput.value = "";
    if (filterDepartment) filterDepartment.value = "";
    if (filterYear) filterYear.value = "";
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
