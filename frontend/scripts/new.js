/* =================================================
   NEWS MODAL & DYNAMIC NEWS LOADING
================================================= */

const newsModal = document.getElementById("newsModal");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const modalDescription = document.getElementById("modalDescription");

function openNews(title, description, date) {
    if (!newsModal || !modalTitle || !modalDate || !modalDescription) return;
    modalTitle.textContent = title;
    modalDate.textContent = date;
    modalDescription.innerHTML = description;

    newsModal.classList.remove("hidden");
    newsModal.classList.add("flex");
    document.body.style.overflow = "hidden";
}

function closeNews() {
    if (!newsModal) return;
    newsModal.classList.add("hidden");
    newsModal.classList.remove("flex");
    document.body.style.overflow = "";
}

if (newsModal) {
    newsModal.addEventListener("click", function (event) {
        if (event.target === newsModal) closeNews();
    });
}
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeNews();
});

const scrollTopBtn = document.getElementById("scrollTopBtn");
if (scrollTopBtn) {
    window.addEventListener("scroll", function () {
        if (window.scrollY > 300) scrollTopBtn.classList.remove("hidden");
        else scrollTopBtn.classList.add("hidden");
    });
}
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

let allNews = [];
let filteredNews = [];
let currentPage = 1;
const itemsPerPage = 40;

const searchInput = document.getElementById('searchInput');
const filterCategory = document.getElementById('filterCategory');
const filterSort = document.getElementById('filterSort');
const newsGrid = document.getElementById('newsGrid');
const resultCount = document.getElementById('resultCount');
const noResults = document.getElementById('noResults');

function updatePaginationControls() {
    const totalPages = Math.ceil(filteredNews.length / itemsPerPage) || 1;
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const pageIndicator = document.getElementById('pageIndicator');
    const paginationControls = document.getElementById('paginationControls');

    if (filteredNews.length <= itemsPerPage) {
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

function renderNewsPage() {
    if (!newsGrid) return;
    
    if (filteredNews.length === 0) {
        newsGrid.innerHTML = '';
        if (noResults) noResults.classList.remove('hidden');
        if (resultCount) resultCount.textContent = 'Showing 0 updates';
        updatePaginationControls();
        return;
    }
    
    if (noResults) noResults.classList.add('hidden');
    if (resultCount) resultCount.textContent = `${filteredNews.length} update${filteredNews.length === 1 ? '' : 's'} available`;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const pageData = filteredNews.slice(startIndex, startIndex + itemsPerPage);

    newsGrid.innerHTML = '';
    pageData.forEach(item => {
        const dateObj = new Date(item.publish_date || item.created_at || new Date());
        const dateStr = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        
        const cat = item.category || 'Announcement';
        let categoryIcon = 'fa-newspaper';
        let categoryBg = 'bg-blue-100 text-blue-700';
        
        if (cat.toLowerCase().includes('announcement')) { categoryIcon = 'fa-bullhorn'; categoryBg = 'bg-red-100 text-red-700'; }
        else if (cat.toLowerCase().includes('event')) { categoryIcon = 'fa-calendar'; categoryBg = 'bg-green-100 text-green-700'; }
        else if (cat.toLowerCase().includes('newsletter')) { categoryIcon = 'fa-envelope'; categoryBg = 'bg-purple-100 text-purple-700'; }

        const article = document.createElement('div');
        article.className = 'bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:-translate-y-1 transition duration-300';
        article.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 rounded-xl ${categoryBg} flex items-center justify-center text-xl">
                    <i class="fa-solid ${categoryIcon}"></i>
                </div>
                <span class="${categoryBg} px-3 py-1 rounded-full text-xs font-semibold">${cat}</span>
            </div>
            <h3 class="text-xl font-bold mt-2">${item.title}</h3>
            <p class="text-sm text-gray-500 mt-2">
                <i class="fa-regular fa-calendar mr-1"></i> ${dateStr}
            </p>
            <p class="text-gray-600 leading-7 mt-4 line-clamp-3 text-sm">
                ${item.content || item.description || ''}
            </p>
            <button class="read-more-btn w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl mt-5 font-semibold transition">
                Read More
            </button>
        `;

        const readBtn = article.querySelector('.read-more-btn');
        if (readBtn) {
            readBtn.addEventListener('click', () => openNews(item.title, item.content || item.description || '', dateStr));
        }
        newsGrid.appendChild(article);
    });

    updatePaginationControls();
}

function applyFilters() {
    const search = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const cat = filterCategory ? filterCategory.value : 'All';
    const sort = filterSort ? filterSort.value : 'Newest';

    filteredNews = allNews.filter(item => {
        const titleMatch = (item.title || '').toLowerCase().includes(search);
        const descMatch = (item.content || item.description || '').toLowerCase().includes(search);
        const searchMatch = search === '' || titleMatch || descMatch;
        const catMatch = cat === 'All' || (item.category || '') === cat;
        return searchMatch && catMatch;
    });

    filteredNews.sort((a, b) => {
        const dateA = new Date(a.publish_date || a.created_at || 0);
        const dateB = new Date(b.publish_date || b.created_at || 0);
        return sort === 'Newest' ? dateB - dateA : dateA - dateB;
    });

    currentPage = 1;
    renderNewsPage();
}

async function loadLiveNews() {
    if (resultCount) resultCount.textContent = 'Loading news...';
    try {
        const res = await fetch('/api/news');
        if (!res.ok) throw new Error('Failed to load');
        const newsItems = await res.json();
        if (Array.isArray(newsItems)) {
            allNews = newsItems;
        }
    } catch (e) {
        console.warn('Could not load live news:', e);
    }
    applyFilters();
}

if (searchInput) searchInput.addEventListener('input', applyFilters);
if (filterCategory) filterCategory.addEventListener('change', applyFilters);
if (filterSort) filterSort.addEventListener('change', applyFilters);

const prevBtn = document.getElementById('prevPageBtn');
const nextBtn = document.getElementById('nextPageBtn');
if (prevBtn) prevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderNewsPage(); } });
if (nextBtn) nextBtn.addEventListener('click', () => { 
    const totalPages = Math.ceil(filteredNews.length / itemsPerPage) || 1;
    if (currentPage < totalPages) { currentPage++; renderNewsPage(); } 
});

document.addEventListener('DOMContentLoaded', loadLiveNews);
window.openNews = openNews;
window.closeNews = closeNews;
window.scrollToTop = scrollToTop;
