if (typeof AOS !== "undefined") {
    AOS.init({
        duration: 1000,
        once: true
    });
}
function toggleMenu(){
    const menu=document.getElementById("mobileMenu");
    menu.classList.toggle("hidden");
}

const counters = document.querySelectorAll(".counter");
const startCounter = (counter) => {
    counter.innerText = "0";
    const target = Number(counter.getAttribute("data-target"));
    const suffix = counter.hasAttribute("data-suffix") ? counter.getAttribute("data-suffix") : "+";
    const duration = 2000; // 2 seconds
    const increment = Math.max(1, target / (duration / 20));
    const updateCounter = () => {
        const current = Number(counter.innerText.replace(/,/g,'').replace(/\+/g,''));
        if(current < target){
            counter.innerText = Math.ceil(current + increment).toLocaleString();
            setTimeout(updateCounter,20);
        }
        else{
            counter.innerText = target.toLocaleString() + suffix;
        }
    };
    updateCounter();
};

// Run animation whenever section appears
const observer = new IntersectionObserver((entries)=>{
entries.forEach(entry=>{
    if(entry.isIntersecting){
        counters.forEach(counter=>{
        startCounter(counter);
    }
);
    observer.unobserve(entry.target);
}
});
},
    {
        threshold:0.5
    });

// Observe the About section
const aboutSection = document.querySelector("#about");
    if(aboutSection){
        observer.observe(aboutSection);
}

/* Fetch data from your Node.js backend
fetch('/api/test')
  .then(response => response.text())
  .then(data => {
    console.log(data); // This will print "Backend is connected!"
  });// Handle errors **/

  const profileBtn = document.getElementById("profileBtn");
  if (profileBtn) {
    profileBtn.addEventListener("click", function () {
      window.location.href = "my-profile.html";
    });
  }
  
// Home Alumni Search Handler
(function() {
  const form = document.getElementById('homeAlumniSearchForm');
  if (!form) return;
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
})();

// SCROLL BUTTON
window.onscroll=function(){
    let btn=document.getElementById("topBtn");
    if(btn){
        if(window.scrollY > 400){
            btn.classList.remove("hidden");
        }
        else{
            btn.classList.add("hidden");
        }
    }
};
function goTop(){
    window.scrollTo({
    top:0,
    behavior:"smooth"
});
}

// HERO IMAGE SLIDER
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

// SUCCESS STORIES CAROUSEL
(function() {
  document.addEventListener('DOMContentLoaded', async () => {
    const section = document.getElementById('success-stories-section');
    const track = document.getElementById('success-stories-track');
    const dotsContainer = document.getElementById('successStoriesDots');
    const prevBtn = document.getElementById('successStoriesPrevBtn');
    const nextBtn = document.getElementById('successStoriesNextBtn');

    if (!section || !track) return;

    try {
      const res = await fetch('/api/success-stories/public');
      if (!res.ok) throw new Error('Failed to fetch success stories');
      const stories = await res.json();

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
          avatarContent = `<span class="text-2xl font-bold text-amber-300">${initial}</span>`;
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
          </div>
        `;

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
      console.error('Error initializing success stories carousel:', err);
      section.style.display = 'none';
    }
  });

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();