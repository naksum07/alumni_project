    /* AOS INITIALIZATION*/

    AOS.init({
      duration: 1000,
      once: true,
      offset: 100
    });

    /* MOBILE MENU*/

    const menuBtn = document.getElementById("menuBtn");
    const mobileMenu = document.getElementById("mobileMenu");

    menuBtn.addEventListener("click", function () {
      mobileMenu.classList.toggle("hidden");
      const isOpen = !mobileMenu.classList.contains("hidden");
      menuBtn.setAttribute("aria-expanded", isOpen);
      menuBtn.innerHTML = isOpen ? "✕" : "☰";
    });

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileMenu.classList.add("hidden");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.innerHTML = "☰";
      });
    });

    /* PREVIOUS PAGE*/
    function goBack() {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "index.html";
      }
    }

    /* SCROLL TO TOP BUTTON*/

    const topBtn =
      document.getElementById("topBtn");
    window.addEventListener("scroll", function () {
      if (window.scrollY > 400) {
        topBtn.classList.remove("hidden");
      } else {
        topBtn.classList.add("hidden");
      }
    });

    /* GO TO TOP*/
    function goTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }