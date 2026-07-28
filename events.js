
// EVENTS PAGE JAVASCRIPT


// Live Search
const searchInput = document.getElementById("searchInput");
const eventCards = document.querySelectorAll(".event-card");

searchInput.addEventListener("keyup", function () {

    const value = searchInput.value.toLowerCase();

    eventCards.forEach(card => {

        const text = card.textContent.toLowerCase();

        if (text.includes(value)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }

    });

});

// Filter Buttons
const filters = document.querySelectorAll(".filter");

filters.forEach(button => {

    button.addEventListener("click", function () {

        filters.forEach(btn => btn.classList.remove("active"));

        this.classList.add("active");

        const category = this.innerText.toLowerCase();

        eventCards.forEach(card => {

            if (category === "all") {

                card.style.display = "block";

            } else {

                const badge = card.querySelector(".badge").innerText.toLowerCase();

                if (badge === category) {

                    card.style.display = "block";

                } else {

                    card.style.display = "none";

                }

            }

        });

    });

});


// Event Registration Modal


const modal = document.getElementById("registerModal");
const registerButtons = document.querySelectorAll(".register-btn");
const closeBtn = document.querySelector(".close");
const form = document.getElementById("registerForm");

// Open Modal
registerButtons.forEach(button => {

    button.addEventListener("click", () => {

        modal.style.display = "flex";

    });

});

// Close Modal
closeBtn.addEventListener("click", () => {

    modal.style.display = "none";

});

// Close when clicking outside
window.addEventListener("click", (e) => {

    if (e.target === modal) {

        modal.style.display = "none";

    }

});

// Submit Form
form.addEventListener("submit", function(e){

    e.preventDefault();

    alert("🎉 Registration Successful!\n\nThank you for registering for this event.");

    form.reset();

    modal.style.display = "none";

});

// Featured Event Button
const featuredButton = document.querySelector(".featured button");

featuredButton.addEventListener("click", function () {
    document.getElementById("registerModal").style.display = "flex";
});