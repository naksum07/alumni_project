// ==============================
// Search Announcements
// ==============================

const searchInput = document.getElementById("searchInput");
const cards = document.querySelectorAll(".announcement-card");

if (searchInput) {

    searchInput.addEventListener("keyup", function () {

        const value = this.value.toLowerCase();

        cards.forEach(card => {

            const text = card.innerText.toLowerCase();

            if (text.includes(value)) {

                card.style.display = "block";

            } else {

                card.style.display = "none";

            }

        });

    });

}


// ==============================
// Filter Buttons
// ==============================

const filters = document.querySelectorAll(".filter");

filters.forEach(button => {

    button.addEventListener("click", function () {

        filters.forEach(btn => btn.classList.remove("active"));

        this.classList.add("active");

        const category = this.innerText.toLowerCase();

        cards.forEach(card => {

            const badge = card.querySelector(".badge").innerText.toLowerCase();

            if (category === "all" || badge === category) {

                card.style.display = "block";

            } else {

                card.style.display = "none";

            }

        });

    });

});


// ==============================
// Read More Modal
// ==============================

const modal = document.getElementById("announcementModal");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");
const closeBtn = document.querySelector(".close");

const readButtons = document.querySelectorAll(".read-btn");

readButtons.forEach(button => {

    button.addEventListener("click", function () {

        const card = this.parentElement;

        const title = card.querySelector("h2").innerText;

        const paragraphs = card.querySelectorAll("p");

        const date = paragraphs[0].innerText;

        const description = paragraphs[1].innerText;

        modalTitle.innerText = title;

        modalText.innerHTML =
            "<strong>" + date + "</strong><br><br>" + description;

        modal.style.display = "block";

    });

});


// ==============================
// Close Modal
// ==============================

closeBtn.onclick = function () {

    modal.style.display = "none";

};

window.onclick = function (event) {

    if (event.target === modal) {

        modal.style.display = "none";

    }

};


// ==============================
// Keyboard Shortcut (ESC)
// ==============================

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

        modal.style.display = "none";

    }

});


// ==============================
// Welcome Notification
// ==============================

window.onload = function () {

    console.log("Announcements Page Loaded Successfully.");

};