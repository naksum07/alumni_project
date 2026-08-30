// SHOW / HIDE PASSWORD
function togglePassword(){
    const password = document.getElementById("password");
    const toggleButton = document.getElementById("toggleButton");
    if(password.type === "password"){
        password.type = "text";
        toggleButton.innerText = "Hide";
    }
    else{
    password.type = "password";
    toggleButton.innerText = "Show";
    }
}

const loginForm = document.getElementById("loginForm");
const formMessage = document.getElementById("formMessage");
const loginBtn = loginForm.querySelector("button[type=submit]");

function showMessage(text, isError){
    formMessage.textContent = text;
    formMessage.classList.remove("hidden", "text-red-600", "text-green-600");
    formMessage.classList.add(isError ? "text-red-600" : "text-green-600");
}

// LOGIN — CALLS THE BACKEND API
loginForm.addEventListener("submit", async function(event){
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if(email === "" || password === ""){
        showMessage("Please fill all fields", true);
        return;
    }

    loginBtn.disabled = true;
    const originalBtnText = loginBtn.textContent;
    loginBtn.textContent = "Logging in...";

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if(!response.ok){
            showMessage(data.message || "Login failed. Please try again.", true);
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        showMessage("Login successful! Redirecting…", false);
        const user = data.user;
        setTimeout(() => {
            if (user.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else {
                // Go back to wherever the user came from, or index.html
                const returnTo = sessionStorage.getItem('returnTo') || 'index.html';
                sessionStorage.removeItem('returnTo');
                window.location.href = returnTo;
            }
        }, 800);
    } catch (err) {
        console.error(err);
        showMessage("Could not reach the server. Please try again later.", true);
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = originalBtnText;
    }
});
