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
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 20);
    const updateCounter = () => {
        const current = Number(counter.innerText.replace(/,/g,''));
        if(current < target){
            counter.innerText = Math.ceil(current + increment).toLocaleString();
            setTimeout(updateCounter,20);
        }
        else{
            counter.innerText = target.toLocaleString() + "+";
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

//AUTH-AWARE NAVBAR + MOBILE MENU 
(function () {
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || 'null');
  const navAuth       = document.getElementById('navAuth');
  const mobileNavAuth = document.getElementById('mobileNavAuth');

  if (token && user) {
    // ---- LOGGED IN — show profile info ----
    const firstName = (user.fullName || user.full_name || 'You').split(' ')[0];

    // Desktop nav
    navAuth.innerHTML = `
      <span class="text-slate-700 font-medium text-sm">Hi, <strong class="text-[#012970]">${firstName}</strong></span>
      <a href="my-profile.html"
         class="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:border-[#012970] hover:text-[#012970] transition text-sm">
        👤 My Profile
      </a>
      <button id="logoutBtn"
         class="bg-[#c4161c] hover:bg-[#a01217] text-white font-semibold px-4 py-2 rounded-lg transition text-sm shadow-sm">
        Logout
      </button>`;

    // Mobile nav
    mobileNavAuth.innerHTML = `
      <p class="text-slate-700 text-sm py-1">Logged in as <strong class="text-[#012970]">${firstName}</strong></p>
      <a href="my-profile.html"
         class="block text-center border border-slate-300 text-slate-700 py-2 rounded-lg hover:border-[#012970] hover:text-[#012970] transition text-sm">
        👤 My Profile
      </a>
      <button id="mobileLogoutBtn"
         class="w-full text-center bg-[#c4161c] hover:bg-[#a01217] text-white py-2 rounded-lg font-semibold text-sm transition">
        Logout
      </button>`;

    // Wire logout buttons
    function doLogout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    document.getElementById('logoutBtn').addEventListener('click', doLogout);
    document.getElementById('mobileLogoutBtn').addEventListener('click', doLogout);

  } else {
    // ---- NOT LOGGED IN — show Login / Register / Admin Login ----
    navAuth.innerHTML = `
      <a href="../admin/login.html"
         class="text-slate-500 font-medium hover:text-[#012970] transition text-sm px-2 border-r border-gray-200 pr-4">
        Admin Login
      </a>
      <a href="login.html"
         class="bg-[#c4161c] hover:bg-[#a01217] text-white font-semibold px-5 py-2 rounded-lg transition text-sm shadow-sm">
        Login / Register
      </a>`;

    mobileNavAuth.innerHTML = `
      <a href="../admin/login.html"
         class="block text-center text-slate-500 py-2 rounded-lg font-medium hover:bg-gray-100 transition text-sm border-b border-gray-200 pb-3 mb-3">
        Admin Login
      </a>
      <div class="space-y-2">
        <a href="login.html"
           class="block text-center bg-[#c4161c] hover:bg-[#a01217] text-white py-2 rounded-lg font-semibold text-sm transition">
          Login / Register
        </a>
      </div>`;

    // Save this page so login can redirect back here
    sessionStorage.setItem('returnTo', 'index.html');
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

  // Close mobile menu when a link is clicked
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.innerHTML = '☰';
    });
  });
})();
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