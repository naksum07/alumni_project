// ================================
// SEARCH FUNCTION
// ================================

const searchInput = document.getElementById("searchInput");
const cards = document.querySelectorAll(".alumni-card");

searchInput.addEventListener("keyup", function () {

    let value = searchInput.value.toLowerCase();

    cards.forEach(card => {

        let text = card.innerText.toLowerCase();

        if (text.includes(value)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }

    });

});


// ================================
// FILTER BUTTONS
// ================================

const filters = document.querySelectorAll(".filter");

filters.forEach(button => {

    button.addEventListener("click", function () {

        filters.forEach(btn => btn.classList.remove("active"));

        this.classList.add("active");

        const category = this.innerText.toLowerCase();

        cards.forEach(card => {

            if (category === "all") {

                card.style.display = "block";

            } else {

                const cardCategory = card.dataset.category.toLowerCase();

                if (cardCategory === category) {

                    card.style.display = "block";

                } else {

                    card.style.display = "none";

                }

            }

        });

    });

});


// ================================
// CONNECT MODAL
// ================================

const modal = document.getElementById("connectModal");

const connectButtons = document.querySelectorAll(".connect-btn");

const closeBtn = document.querySelector(".close");

connectButtons.forEach(button => {

    button.addEventListener("click", () => {

        modal.style.display = "flex";

    });

});

closeBtn.addEventListener("click", () => {

    modal.style.display = "none";

});

window.addEventListener("click", function (e) {

    if (e.target === modal) {

        modal.style.display = "none";

    }

});


// ================================
// CONNECT FORM
// ================================

const form = document.getElementById("connectForm");

form.addEventListener("submit", function (e) {

    e.preventDefault();

    alert("🎉 Connection Request Sent Successfully!");

    form.reset();

    modal.style.display = "none";

});


// ================================
// CARD HOVER EFFECT
// ================================

cards.forEach(card => {

    card.addEventListener("mouseenter", () => {

        card.style.transition = ".3s";

    });

});


// ================================
// SMOOTH SCROLL
// ================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function (e) {

        e.preventDefault();

        document.querySelector(this.getAttribute("href")).scrollIntoView({

            behavior: "smooth"

        });

    });

});