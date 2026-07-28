// ==============================
// Forgot Password JavaScript
// ==============================

const forgotForm = document.getElementById("forgotForm");
const successModal = document.getElementById("successModal");
const closeModal = document.getElementById("closeModal");

// ==============================
// Submit Form
// ==============================

forgotForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();

    if (email === "") {

        alert("Please enter your registered email address.");

        return;

    }

    successModal.style.display = "block";

    forgotForm.reset();

});

// ==============================
// Close Modal
// ==============================

closeModal.addEventListener("click", function () {

    successModal.style.display = "none";

});

window.addEventListener("click", function (e) {

    if (e.target === successModal) {

        successModal.style.display = "none";

    }

});

// ==============================
// ESC Key Support
// ==============================

document.addEventListener("keydown", function (e) {

    if (e.key === "Escape") {

        successModal.style.display = "none";

    }

});

// ==============================
// Email Validation
// ==============================

const emailInput = document.getElementById("email");

emailInput.addEventListener("input", function () {

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (this.value === "") {

        this.style.borderColor = "#ddd";

    } else if (emailPattern.test(this.value)) {

        this.style.borderColor = "green";

    } else {

        this.style.borderColor = "red";

    }

});

// ==============================
// Console Message
// ==============================

console.log("Forgot Password Page Loaded Successfully");