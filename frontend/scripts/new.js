/* =================================================
   NEWS MODAL & DYNAMIC NEWS LOADING
================================================= */

const newsModal = document.getElementById("newsModal");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const modalDescription = document.getElementById("modalDescription");

function openNews(itemOrTitle, description, date) {
    if (!newsModal || !modalTitle || !modalDate || !modalDescription) return;

    let title = itemOrTitle;
    let desc = description || '';
    let dt = date || '';
    let extraHtml = '';

    if (typeof itemOrTitle === 'object' && itemOrTitle !== null) {
        const item = itemOrTitle;
        title = item.title;
        desc = item.content || item.description || '';
        const isEvent = (item.category || '').toLowerCase().includes('event');
        if (isEvent && item.event_date) {
            const d = new Date(item.event_date);
            dt = 'Event Date: ' + d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        } else {
            const d = new Date(item.publish_date || item.created_at || new Date());
            dt = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        }

        if (isEvent) {
            extraHtml = `
                <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 text-sm text-slate-700 space-y-1.5">
                    ${item.event_date ? `<p><i class="fa-solid fa-calendar text-blue-600 w-5"></i> <strong>Date:</strong> ${new Date(item.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>` : ''}
                    ${item.event_time ? `<p><i class="fa-solid fa-clock text-blue-600 w-5"></i> <strong>Time:</strong> ${item.event_time}</p>` : ''}
                    ${item.venue ? `<p><i class="fa-solid fa-location-dot text-red-500 w-5"></i> <strong>Venue:</strong> ${item.venue}</p>` : ''}
                    ${item.host ? `<p><i class="fa-solid fa-user-tie text-slate-600 w-5"></i> <strong>Host:</strong> ${item.host}</p>` : ''}
                </div>
                <div class="mt-4 mb-2">
                    <a href="events.html" class="inline-flex items-center gap-2 bg-[#012970] hover:bg-[#011a47] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition">
                        <i class="fa-solid fa-ticket"></i> View in Events / Register
                    </a>
                </div>
            `;
        }
    }

    modalTitle.textContent = title;
    modalDate.textContent = dt;
    modalDescription.innerHTML = extraHtml ? extraHtml + '<div class="mt-4">' + desc + '</div>' : desc;

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
        const cat = item.category || 'Announcement';
        const isEvent = cat.toLowerCase().includes('event');
        const isAnnouncement = cat.toLowerCase().includes('announcement');

        let dateStr = '';
        if (isEvent && item.event_date) {
            dateStr = 'Event: ' + new Date(item.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        } else {
            const dateObj = new Date(item.publish_date || item.created_at || new Date());
            dateStr = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        }
        
        let categoryIcon = 'fa-newspaper';
        let categoryBg = 'bg-blue-100 text-blue-700';
        
        if (isAnnouncement) { categoryIcon = 'fa-bullhorn'; categoryBg = 'bg-red-100 text-red-700'; }
        else if (isEvent) { categoryIcon = 'fa-calendar'; categoryBg = 'bg-green-100 text-green-700'; }
        else if (cat.toLowerCase().includes('newsletter')) { categoryIcon = 'fa-envelope'; categoryBg = 'bg-purple-100 text-purple-700'; }

        const priorityBadge = (isAnnouncement && item.priority === 'urgent')
            ? '<span class="bg-red-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ml-1">Urgent</span>'
            : '';

        let eventPills = '';
        if (isEvent && (item.venue || item.event_time)) {
            eventPills = `
                <div class="flex flex-wrap gap-2 text-xs text-slate-500 mt-2">
                    ${item.venue ? `<span class="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded"><i class="fa-solid fa-location-dot text-red-500 text-[10px]"></i> ${item.venue}</span>` : ''}
                    ${item.event_time ? `<span class="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded"><i class="fa-solid fa-clock text-blue-500 text-[10px]"></i> ${item.event_time}</span>` : ''}
                </div>
            `;
        }

        const article = document.createElement('div');
        article.className = 'bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col justify-between';
        article.innerHTML = `
            <div>
                <div class="flex justify-between items-start mb-4">
                    <div class="w-12 h-12 rounded-xl ${categoryBg} flex items-center justify-center text-xl">
                        <i class="fa-solid ${categoryIcon}"></i>
                    </div>
                    <div class="flex items-center gap-1">
                        <span class="${categoryBg} px-3 py-1 rounded-full text-xs font-semibold">${cat}</span>
                        ${priorityBadge}
                    </div>
                </div>
                <h3 class="text-xl font-bold mt-2 text-slate-900">${item.title}</h3>
                <p class="text-sm text-gray-500 mt-2">
                    <i class="fa-regular fa-calendar mr-1"></i> ${dateStr}
                </p>
                ${eventPills}
                <p class="text-gray-600 leading-7 mt-3 line-clamp-3 text-sm">
                    ${item.content || item.description || ''}
                </p>
            </div>
            <button class="read-more-btn w-full bg-[#012970] hover:bg-[#011a47] text-white py-3 rounded-xl mt-5 font-semibold transition">
                Read More
            </button>
        `;

        const readBtn = article.querySelector('.read-more-btn');
        if (readBtn) {
            readBtn.addEventListener('click', () => openNews(item));
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
        const itemCat = (item.category || '').toLowerCase();
        const selectedCat = cat.toLowerCase();
        const catMatch = cat === 'All' || itemCat === selectedCat || itemCat.includes(selectedCat) || selectedCat.includes(itemCat);
        return searchMatch && catMatch;
    });

    filteredNews.sort((a, b) => {
        const dateA = new Date(a.publish_date || a.event_date || a.created_at || 0);
        const dateB = new Date(b.publish_date || b.event_date || b.created_at || 0);
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
