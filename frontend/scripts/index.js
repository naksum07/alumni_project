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