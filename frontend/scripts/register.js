const registerForm = document.getElementById("registerForm");
const formMessage = document.getElementById("formMessage");
const submitBtn = registerForm.querySelector("button[type=submit]");

function showMessage(text, isError) {
    formMessage.textContent = text;
    formMessage.classList.remove("hidden", "text-red-600", "text-green-600");
    formMessage.classList.add(isError ? "text-red-600" : "text-green-600");
}

registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const role = document.getElementById("role").value;
    const department = document.getElementById("department").value;
    const graduationYear = document.getElementById("graduationYear").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        showMessage("Passwords do not match", true);
        return;
    }

    submitBtn.disabled = true;
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = "Creating Account...";

    try {
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fullName,
                email,
                phone,
                password,
                role,
                department,
                graduationYear: graduationYear ? Number(graduationYear) : null,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.message || "Registration failed. Please try again.", true);
            return;
        }

        showMessage("Registration successful! Redirecting to login...", false);
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1200);
    } catch (err) {
        console.error(err);
        showMessage("Could not reach the server. Please try again later.", true);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
});
