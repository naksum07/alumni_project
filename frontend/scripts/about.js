if (typeof AOS !== 'undefined') {
  AOS.init({
    duration: 1000,
    once: true,
    offset: 100,
  });
}

  /* Navigate to Previous Page */

function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "index.html";
  }
}

/* Scroll-to-Top Button Visibility */

const topBtn = document.getElementById("topBtn");

if (topBtn) {
  window.addEventListener("scroll", function () {
    if (window.scrollY > 400) {
      topBtn.classList.remove("hidden");
    } else {
      topBtn.classList.add("hidden");
    }
  });
}

/* Scroll to Top */

function goTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}