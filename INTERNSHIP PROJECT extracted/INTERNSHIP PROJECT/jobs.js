const searchInput=document.getElementById("searchInput");

const cards=document.querySelectorAll(".job-card");

searchInput.addEventListener("keyup",()=>{

let value=searchInput.value.toLowerCase();

cards.forEach(card=>{

let text=card.innerText.toLowerCase();

card.style.display=text.includes(value)?"block":"none";

});

});

// Open Application Form
const applyButtons = document.querySelectorAll(".apply-btn");
const modal = document.getElementById("applyModal");
const closeBtn = document.querySelector(".close");
const form = document.getElementById("jobForm");

applyButtons.forEach(button => {

    button.addEventListener("click", () => {
        modal.style.display = "flex";
    });

});

closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

window.addEventListener("click", (e) => {

    if (e.target === modal) {
        modal.style.display = "none";
    }

});

form.addEventListener("submit", function(e){

    e.preventDefault();

    alert("🎉 Application Submitted Successfully!");

    form.reset();

    modal.style.display = "none";

});