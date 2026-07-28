// ===============================
// SEARCH CONTACTS
// ===============================

const searchInput = document.getElementById("searchInput");
const chatItems = document.querySelectorAll(".chat-item");

searchInput.addEventListener("keyup", function () {

    const value = this.value.toLowerCase();

    chatItems.forEach(item => {

        const name = item.querySelector("h4").textContent.toLowerCase();

        if (name.includes(value)) {

            item.style.display = "flex";

        } else {

            item.style.display = "none";

        }

    });

});


// ===============================
// SEND MESSAGE
// ===============================

const sendBtn = document.getElementById("sendBtn");

const messageInput = document.getElementById("messageInput");

const chatBody = document.getElementById("chatBody");

function sendMessage() {

    const message = messageInput.value.trim();

    if (message === "") {

        alert("Please type a message.");

        return;

    }

    const div = document.createElement("div");

    div.className = "sent";

    div.textContent = message;

    chatBody.appendChild(div);

    messageInput.value = "";

    chatBody.scrollTop = chatBody.scrollHeight;

}

sendBtn.addEventListener("click", sendMessage);


// ===============================
// PRESS ENTER TO SEND
// ===============================

messageInput.addEventListener("keypress", function (e) {

    if (e.key === "Enter") {

        e.preventDefault();

        sendMessage();

    }

});


// ===============================
// SWITCH CHAT
// ===============================

chatItems.forEach(item => {

    item.addEventListener("click", function () {

        chatItems.forEach(chat => chat.classList.remove("active"));

        this.classList.add("active");

    });

});


// ===============================
// AUTO SCROLL
// ===============================

window.onload = function () {

    chatBody.scrollTop = chatBody.scrollHeight;

};