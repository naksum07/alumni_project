// 1. AOS Animation Initialization
if (typeof AOS !== "undefined") {
    AOS.init({
        duration: 1000,
        once: true
    });
}

// Utility: HTML Escaping
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// 2. Mobile Menu Toggle
function toggleMenu() {
    const menu = document.getElementById("mobileMenu");
    if (menu) {
        menu.classList.toggle("hidden");
    }
}
window.toggleMenu = toggleMenu;

// 3. Scroll to Top Button Handlers
window.onscroll = function() {
    let btn = document.getElementById("topBtn");
    if (btn) {
        if (window.scrollY > 400) {
            btn.classList.remove("hidden");
        } else {
            btn.classList.add("hidden");
        }
    }
};

function goTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}
window.goTop = goTop;

// 4. Statistics Counters Animation (About Section)
(function() {
    document.addEventListener("DOMContentLoaded", () => {
        const counters = document.querySelectorAll(".counter");
        if (counters.length === 0) return;

        const startCounter = (counter) => {
            counter.innerText = "0";
            const target = Number(counter.getAttribute("data-target"));
            const suffix = counter.hasAttribute("data-suffix") ? counter.getAttribute("data-suffix") : "+";
            const duration = 2000;
            const increment = Math.max(1, target / (duration / 20));
            const updateCounter = () => {
                const current = Number(counter.innerText.replace(/,/g, '').replace(/\+/g, ''));
                if (current < target) {
                    counter.innerText = Math.ceil(current + increment).toLocaleString();
                    setTimeout(updateCounter, 20);
                } else {
                    counter.innerText = target.toLocaleString() + suffix;
                }
            };
            updateCounter();
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    counters.forEach(counter => startCounter(counter));
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        const aboutSection = document.querySelector("#about");
        if (aboutSection) {
            observer.observe(aboutSection);
        }
    });
})();

// 5. User Profile Button & Search Form Handlers
(function() {
    document.addEventListener("DOMContentLoaded", () => {
        const profileBtn = document.getElementById("profileBtn");
        if (profileBtn) {
            profileBtn.addEventListener("click", function() {
                window.location.href = "my-profile.html";
            });
        }

        const form = document.getElementById('homeAlumniSearchForm');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const searchVal = document.getElementById('homeSearchInput')?.value.trim() || '';
                const deptVal = document.getElementById('homeDeptSelect')?.value || '';
                const batchVal = document.getElementById('homeBatchSelect')?.value || '';

                const params = new URLSearchParams();
                if (searchVal) params.set('search', searchVal);
                if (deptVal) params.set('department', deptVal);
                if (batchVal) params.set('batch', batchVal);

                const queryStr = params.toString();
                window.location.href = 'alumni-directory.html' + (queryStr ? '?' + queryStr : '');
            });
        }
    });
})();

// 6. Hero Image Slider
(function() {
    document.addEventListener('DOMContentLoaded', () => {
        const track = document.getElementById('heroSliderTrack');
        if (!track) return;

        const slides = track.children;
        const totalSlides = slides.length;
        if (totalSlides <= 1) return;

        const prevBtn = document.getElementById('heroSliderPrevBtn');
        const nextBtn = document.getElementById('heroSliderNextBtn');
        const dotsContainer = document.getElementById('heroSliderDots');
        const dots = dotsContainer ? dotsContainer.querySelectorAll('button') : [];

        let currentSlide = 0;
        let slideInterval = null;

        function goToSlide(index) {
            currentSlide = (index + totalSlides) % totalSlides;
            track.style.transform = `translateX(-${currentSlide * 100}%)`;

            dots.forEach((dot, idx) => {
                if (idx === currentSlide) {
                    dot.className = 'h-1.5 sm:h-2 rounded-full bg-white transition-all duration-300 w-4 sm:w-5 cursor-pointer';
                } else {
                    dot.className = 'h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-white/40 hover:bg-white/80 transition-all duration-300 cursor-pointer';
                }
            });
        }

        function nextSlide() {
            goToSlide(currentSlide + 1);
        }

        function prevSlide() {
            goToSlide(currentSlide - 1);
        }

        function startAutoPlay() {
            stopAutoPlay();
            slideInterval = setInterval(nextSlide, 4500);
        }

        function stopAutoPlay() {
            if (slideInterval) clearInterval(slideInterval);
        }

        if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startAutoPlay(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startAutoPlay(); });

        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                goToSlide(idx);
                startAutoPlay();
            });
        });

        const sliderParent = track.closest('.group');
        if (sliderParent) {
            sliderParent.addEventListener('mouseenter', stopAutoPlay);
            sliderParent.addEventListener('mouseleave', startAutoPlay);
            sliderParent.addEventListener('touchstart', stopAutoPlay, { passive: true });
            sliderParent.addEventListener('touchend', startAutoPlay, { passive: true });
        }

        startAutoPlay();
    });
})();

// 7. Announcements Carousel
(function() {
    document.addEventListener('DOMContentLoaded', async () => {
        const section = document.getElementById('announcements-section');
        const annCarousel = document.getElementById('announcements-carousel');
        if (!section || !annCarousel) return;

        try {
            const annRes = await fetch(getApiUrl('/api/announcements')).catch(() => null);
            if (!annRes || !annRes.ok) return;

            const announcements = await annRes.json().catch(() => null);
            if (!Array.isArray(announcements) || announcements.length === 0) return;

            const priorityRank = { urgent: 1, normal: 2, low: 3 };
            announcements.sort((a, b) => {
                const rankA = priorityRank[(a.priority || 'normal').toLowerCase()] || 2;
                const rankB = priorityRank[(b.priority || 'normal').toLowerCase()] || 2;
                if (rankA !== rankB) return rankA - rankB;
                return new Date(b.created_at || 0) - new Date(a.created_at || 0);
            });

            const dotsContainer = document.getElementById('announcements-dots');
            const prevBtn = document.getElementById('announcements-prev-btn');
            const nextBtn = document.getElementById('announcements-next-btn');
            const wrapper = document.getElementById('announcements-carousel-wrapper');

            annCarousel.innerHTML = announcements.map(a => {
                const priorityClass = a.priority === 'urgent'
                    ? 'bg-red-100 text-red-700 border-red-200'
                    : (a.priority === 'low' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-amber-100 text-amber-700 border-amber-200');
                const priorityIcon = a.priority === 'urgent'
                    ? 'fa-triangle-exclamation'
                    : (a.priority === 'low' ? 'fa-circle-info' : 'fa-bullhorn');
                const dateStr = a.created_at ? new Date(a.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';
                return `
                <div class="shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between mb-3">
                            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${priorityClass}">
                                <i class="fa-solid ${priorityIcon}"></i>
                                <span class="capitalize">${a.priority || 'Normal'}</span>
                            </span>
                            <span class="text-xs text-slate-400"><i class="fa-regular fa-clock mr-1"></i>${dateStr}</span>
                        </div>
                        <h3 class="text-lg font-bold text-slate-900 mb-2">${escapeHTML(a.title)}</h3>
                        <p class="text-slate-600 text-sm leading-relaxed">${escapeHTML(a.content)}</p>
                    </div>
                </div>`;
            }).join('');

            section.style.display = 'block';

            let currentIndex = 0;
            let autoPlayTimer = null;

            function getVisibleCards() {
                if (window.innerWidth >= 1024) return 3;
                if (window.innerWidth >= 768) return 2;
                return 1;
            }

            function getMaxIndex() {
                const visible = getVisibleCards();
                return Math.max(0, announcements.length - visible);
            }

            function updateCarousel() {
                const maxIndex = getMaxIndex();
                if (currentIndex > maxIndex) currentIndex = maxIndex;
                if (currentIndex < 0) currentIndex = 0;

                const card = annCarousel.children[0];
                if (card) {
                    const gap = 24;
                    const cardWidth = card.getBoundingClientRect().width || card.offsetWidth || 0;
                    const shift = currentIndex * (cardWidth + gap);
                    annCarousel.style.transform = `translateX(-${shift}px)`;
                }

                renderDots();
            }

            function renderDots() {
                const maxIndex = getMaxIndex();
                if (!dotsContainer) return;
                if (maxIndex <= 0) {
                    dotsContainer.innerHTML = '';
                    return;
                }
                dotsContainer.innerHTML = Array.from({ length: maxIndex + 1 }, (_, i) => `
                    <button class="h-2.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-[#c4161c] w-6' : 'bg-slate-300 hover:bg-slate-400 w-2.5'}"
                        aria-label="Go to slide ${i + 1}" data-index="${i}"></button>
                `).join('');

                dotsContainer.querySelectorAll('button').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        currentIndex = parseInt(btn.getAttribute('data-index'), 10);
                        updateCarousel();
                        resetTimer();
                    });
                });
            }

            function nextSlide() {
                const maxIndex = getMaxIndex();
                if (maxIndex <= 0) return;
                currentIndex = (currentIndex >= maxIndex) ? 0 : currentIndex + 1;
                updateCarousel();
            }

            function prevSlide() {
                const maxIndex = getMaxIndex();
                if (maxIndex <= 0) return;
                currentIndex = (currentIndex <= 0) ? maxIndex : currentIndex - 1;
                updateCarousel();
            }

            if (prevBtn) prevBtn.addEventListener('click', (e) => { e.preventDefault(); prevSlide(); resetTimer(); });
            if (nextBtn) nextBtn.addEventListener('click', (e) => { e.preventDefault(); nextSlide(); resetTimer(); });

            function startTimer() {
                stopTimer();
                autoPlayTimer = setInterval(nextSlide, 5500);
            }

            function stopTimer() {
                if (autoPlayTimer) clearInterval(autoPlayTimer);
            }

            function resetTimer() {
                stopTimer();
                startTimer();
            }

            if (wrapper) {
                wrapper.addEventListener('mouseenter', stopTimer);
                wrapper.addEventListener('mouseleave', startTimer);
                wrapper.addEventListener('touchstart', stopTimer, { passive: true });
                wrapper.addEventListener('touchend', startTimer, { passive: true });
            }

            window.addEventListener('resize', updateCarousel);
            setTimeout(updateCarousel, 50);
            startTimer();
        } catch (err) {
            // Silently handle backend fetch errors
        }
    });
})();


// 8. Feedback Carousel
(function() {
    document.addEventListener('DOMContentLoaded', async () => {
        const section = document.getElementById('feedback-section');
        const carousel = document.getElementById('feedback-carousel');
        if (!section || !carousel) return;

        try {
            const res = await fetch(getApiUrl('/api/feedback')).catch(() => null);
            if (res && res.ok) {
                const feedbacks = await res.json().catch(() => null);
                if (Array.isArray(feedbacks) && feedbacks.length > 0) {
                    carousel.innerHTML = feedbacks.map(f => {
                        const stars = Array(5).fill(0).map((_, i) => i < f.rating ? '<i class="fa-solid fa-star text-yellow-400"></i>' : '<i class="fa-solid fa-star text-gray-300"></i>').join('');
                        return `
                        <div class="snap-center shrink-0 w-80 bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                            <div>
                                <div class="flex gap-1 mb-4 text-sm">${stars}</div>
                                <p class="text-gray-600 italic">"${escapeHTML(f.message)}"</p>
                            </div>
                            <div class="mt-6 font-semibold text-[#012970]">- ${escapeHTML(f.author_name || 'Anonymous User')}</div>
                        </div>`;
                    }).join('');
                    section.style.display = 'block';
                }
            }
        } catch (err) {
            // Silently handle feedback fetch errors
        }
    });
})();

// 9. Success Stories Carousel
(function() {
    document.addEventListener('DOMContentLoaded', async () => {
        const section = document.getElementById('success-stories-section');
        const track = document.getElementById('success-stories-track');
        const dotsContainer = document.getElementById('successStoriesDots');
        const prevBtn = document.getElementById('successStoriesPrevBtn');
        const nextBtn = document.getElementById('successStoriesNextBtn');

        if (!section || !track) return;

        try {
            const res = await fetch(getApiUrl('/api/success-stories/public')).catch(() => null);
            if (!res || !res.ok) return;

            const stories = await res.json().catch(() => null);
            if (!Array.isArray(stories) || stories.length === 0) {
                section.style.display = 'none';
                return;
            }

            section.style.display = 'block';
            track.innerHTML = '';
            if (dotsContainer) dotsContainer.innerHTML = '';

            stories.forEach((story, idx) => {
                const slide = document.createElement('div');
                slide.className = 'min-w-full shrink-0 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 px-2 py-4 select-none';

                const author = story.author || {};
                const authorName = escapeHTML(author.name || 'Alumni Member');
                const roleInfo = [author.job_title, author.company].filter(Boolean).map(escapeHTML).join(' at ');
                const eduInfo = [author.department, author.graduation_year ? `Batch of ${author.graduation_year}` : ''].filter(Boolean).map(escapeHTML).join(' • ');

                let avatarContent = '';
                if (author.profile_picture) {
                    avatarContent = `<img src="${escapeHTML(author.profile_picture)}" alt="${authorName}" class="w-full h-full object-cover">`;
                } else {
                    const initial = authorName.charAt(0).toUpperCase();
                    avatarContent = `<div class="w-full h-full bg-[#012970] text-white flex items-center justify-center text-3xl font-bold">${initial}</div>`;
                }

                slide.innerHTML = `
                <div class="flex flex-col items-center md:items-start shrink-0 text-center md:text-left">
                    <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-800 border-2 border-amber-400/60 shadow-lg overflow-hidden flex items-center justify-center mb-3">
                        ${avatarContent}
                    </div>
                   <h4 class="text-base sm:text-lg font-bold text-white leading-snug">${authorName}</h4>
                    ${roleInfo ? `<p class="text-xs text-amber-300 font-medium mt-0.5">${roleInfo}</p>` : ''}
                    ${eduInfo ? `<p class="text-[11px] text-slate-400 mt-0.5">${eduInfo}</p>` : ''}
                </div>

                <div class="flex-1 text-center md:text-left flex flex-col justify-center">
                    <div class="flex justify-center md:justify-start mb-2 text-amber-400 text-lg">
                        <i class="fa-solid fa-quote-left mr-2"></i>
                    </div>
                    <h3 class="text-lg sm:text-xl md:text-2xl font-bold text-white leading-snug mb-3">${escapeHTML(story.title)}</h3>
                    <p class="text-xs sm:text-sm text-slate-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line pr-2">${escapeHTML(story.story_text)}</p>
                </div>`;

                track.appendChild(slide);

                if (dotsContainer) {
                    const dot = document.createElement('button');
                    dot.setAttribute('aria-label', `Slide ${idx + 1}`);
                    dot.className = idx === 0
                        ? 'h-2 rounded-full bg-amber-400 transition-all duration-300 w-6 cursor-pointer'
                        : 'h-2 w-2 rounded-full bg-slate-400 hover:bg-slate-200 transition-all duration-300 cursor-pointer';
                    dot.addEventListener('click', () => {
                        goToSlide(idx);
                        startAutoPlay();
                    });
                    dotsContainer.appendChild(dot);
                }
            });

            const totalSlides = stories.length;
            let currentSlide = 0;
            let slideInterval = null;

            function goToSlide(index) {
                currentSlide = (index + totalSlides) % totalSlides;
                track.style.transform = `translateX(-${currentSlide * 100}%)`;

                if (dotsContainer) {
                    const dots = dotsContainer.querySelectorAll('button');
                    dots.forEach((dot, i) => {
                        if (i === currentSlide) {
                            dot.className = 'h-2 rounded-full bg-amber-400 transition-all duration-300 w-6 cursor-pointer';
                        } else {
                            dot.className = 'h-2 w-2 rounded-full bg-slate-400 hover:bg-slate-200 transition-all duration-300 cursor-pointer';
                        }
                    });
                }
            }

            function nextSlide() {
                goToSlide(currentSlide + 1);
            }

            function prevSlide() {
                goToSlide(currentSlide - 1);
            }

            function startAutoPlay() {
                stopAutoPlay();
                if (totalSlides > 1) {
                    slideInterval = setInterval(nextSlide, 5500);
                }
            }

            function stopAutoPlay() {
                if (slideInterval) clearInterval(slideInterval);
            }

            if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startAutoPlay(); });
            if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startAutoPlay(); });

            const wrapper = document.getElementById('success-stories-carousel-wrapper');
            if (wrapper) {
                wrapper.addEventListener('mouseenter', stopAutoPlay);
                wrapper.addEventListener('mouseleave', startAutoPlay);
                wrapper.addEventListener('touchstart', stopAutoPlay, { passive: true });
                wrapper.addEventListener('touchend', startAutoPlay, { passive: true });
            }

            if (totalSlides <= 1) {
                if (prevBtn) prevBtn.style.display = 'none';
                if (nextBtn) nextBtn.style.display = 'none';
                if (dotsContainer) dotsContainer.style.display = 'none';
            } else {
                startAutoPlay();
            }

        } catch (err) {
            section.style.display = 'none';
        }
    });
})();


