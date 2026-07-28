// ==============================
// Star Rating
// ==============================

const stars = document.querySelectorAll(".star");
let selectedRating = 0;

stars.forEach((star, index) => {

    star.addEventListener("click", () => {

        selectedRating = index + 1;

        stars.forEach((s, i) => {

            if (i < selectedRating) {

                s.classList.remove("fa-regular");
                s.classList.add("fa-solid");
                s.classList.add("active");

            } else {

                s.classList.remove("fa-solid");
                s.classList.add("fa-regular");
                s.classList.remove("active");

            }

        });

    });

});


// ==============================
// Emoji Rating
// ==============================

const emojis = document.querySelectorAll(".emoji");

emojis.forEach(emoji => {

    emoji.addEventListener("click", () => {

        emojis.forEach(e => e.classList.remove("active"));

        emoji.classList.add("active");

    });

});


// ==============================
// Feedback Form
// ==============================

const form = document.getElementById("feedbackForm");
const modal = document.getElementById("successModal");
const closeBtn = document.getElementById("closeModal");

form.addEventListener("submit", function(e){

    e.preventDefault();

    if(selectedRating===0){

        alert("Please give a star rating.");

        return;

    }

    modal.style.display="block";

    form.reset();

    stars.forEach(star=>{

        star.classList.remove("fa-solid");
        star.classList.add("fa-regular");
        star.classList.remove("active");

    });

    emojis.forEach(emoji=>{

        emoji.classList.remove("active");

    });

    selectedRating=0;

});


// ==============================
// Close Modal
// ==============================

closeBtn.onclick=function(){

    modal.style.display="none";

};

window.onclick=function(event){

    if(event.target==modal){

        modal.style.display="none";

    }

};


// ==============================
// Reset Button
// ==============================

form.addEventListener("reset",function(){

    stars.forEach(star=>{

        star.classList.remove("fa-solid");
        star.classList.add("fa-regular");
        star.classList.remove("active");

    });

    emojis.forEach(emoji=>{

        emoji.classList.remove("active");

    });

    selectedRating=0;

});


// ==============================
// Console Message
// ==============================

console.log("Feedback Page Loaded Successfully");