// ==============================
// Contact Form
// ==============================

const contactForm = document.getElementById("contactForm");
const successModal = document.getElementById("successModal");
const closeModal = document.getElementById("closeModal");

contactForm.addEventListener("submit", function(e){

    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();

    if(name==="" || email==="" || subject==="" || message===""){

        alert("Please fill in all fields.");

        return;

    }

    successModal.style.display="block";

    contactForm.reset();

});


// ==============================
// Close Modal Button
// ==============================

closeModal.addEventListener("click",function(){

    successModal.style.display="none";

});


// ==============================
// Close When Clicking Outside
// ==============================

window.addEventListener("click",function(event){

    if(event.target===successModal){

        successModal.style.display="none";

    }

});


// ==============================
// ESC Key Closes Modal
// ==============================

document.addEventListener("keydown",function(event){

    if(event.key==="Escape"){

        successModal.style.display="none";

    }

});


// ==============================
// Console Message
// ==============================

console.log("Contact Page Loaded Successfully");