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
    modalDescription.textContent = description;

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

/* Close modal when clicking outside */
if (newsModal) {
    newsModal.addEventListener("click", function (event) {
        if (event.target === newsModal) {
            closeNews();
        }
    });
}

/* Close modal with ESC */
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeNews();
    }
});

/* =================================================
   CONTACT
================================================= */
function contactMessage() {
    alert("Thank you for contacting the Alumni Office!");
}

/* =================================================
   SCROLL TO TOP
================================================= */
const scrollTopBtn = document.getElementById("scrollTopBtn");

if (scrollTopBtn) {
    window.addEventListener("scroll", function () {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.remove("hidden");
        } else {
            scrollTopBtn.classList.add("hidden");
        }
    });
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

/* =================================================
   FETCH LIVE PUBLISHED NEWS FROM BACKEND API
================================================= */
async function loadLiveNews() {
    const newsGrid = document.getElementById('newsGrid');
    if (!newsGrid) return;

    try {
        const res = await fetch('/api/news');
        if (!res.ok) return; // Keep hardcoded fallback if API fails
        const newsItems = await res.json();
        if (!Array.isArray(newsItems) || newsItems.length === 0) return; // Keep default cards if empty

        newsGrid.innerHTML = '';
        newsItems.forEach(item => {
            const dateStr = item.publish_date ? new Date(item.publish_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
            const categoryIcon = item.category === 'Announcement' ? 'fa-bullhorn' : 'fa-newspaper';
            const categoryBg = item.category === 'Announcement' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700';

            const article = document.createElement('article');
            article.className = 'bg-white rounded-2xl shadow-md p-7 border border-gray-100 hover:-translate-y-1 hover:shadow-xl transition';
            article.innerHTML = `
                <div class="flex items-center gap-4 mb-5">
                    <div class="w-12 h-12 rounded-lg ${categoryBg} flex items-center justify-center flex-shrink-0">
                        <i class="fa-solid ${categoryIcon} text-xl"></i>
                    </div>
                    <div>
                        <h2 class="text-xl font-bold">${item.title}</h2>
                        <p class="text-sm text-gray-500 mt-1">
                            <i class="fa-regular fa-calendar mr-1"></i>
                            ${dateStr}
                        </p>
                    </div>
                </div>
                <p class="text-gray-600 leading-7 line-clamp-3">
                    ${item.content}
                </p>
                <button class="read-more-btn text-blue-700 font-semibold mt-5 hover:underline flex items-center gap-1">
                    Read More <i class="fa-solid fa-arrow-right text-xs"></i>
                </button>
            `;

            const readBtn = article.querySelector('.read-more-btn');
            if (readBtn) {
                readBtn.addEventListener('click', () => openNews(item.title, item.content, dateStr));
            }
            newsGrid.appendChild(article);
        });

    } catch (e) {
        console.warn('Could not load live news:', e);
    }
}

document.addEventListener('DOMContentLoaded', loadLiveNews);

window.openNews = openNews;
window.closeNews = closeNews;
window.scrollToTop = scrollToTop;
