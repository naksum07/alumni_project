// ==============================
// Admin Dashboard - Upgraded
// ==============================

const addBtn = document.getElementById("addAlumni");
const addModal = document.getElementById("addModal");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");
const alumniForm = document.getElementById("alumniForm");
const tableBody = document.querySelector("tbody");

let editRow = null;
let nextId = 106;

// ==============================
// Dashboard Counter Animation
// ==============================

function animateCounter(id, target){

let count = 0;

const element = document.getElementById(id);

const speed = Math.ceil(target / 50);

const timer = setInterval(()=>{

count += speed;

if(count >= target){

count = target;

clearInterval(timer);

}

element.textContent = count;

},30);

}

window.onload = function(){

animateCounter("totalAlumni",245);

animateCounter("totalJobs",38);

animateCounter("totalEvents",16);

animateCounter("totalFeedback",124);

attachButtons();

};

// ==============================
// Open Modal
// ==============================

addBtn.onclick = function(){

editRow = null;

alumniForm.reset();

addModal.style.display = "block";

};

// ==============================
// Close Modal
// ==============================

if (closeModal) closeModal.onclick = closePopup;
if (cancelBtn) cancelBtn.onclick = closePopup;

window.onclick = function(e){

if(e.target==addModal){

closePopup();

}

};

function closePopup(){

addModal.style.display="none";

}

// ==============================
// Save Alumni
// ==============================

alumniForm.addEventListener("submit",function(e){

e.preventDefault();

const name=document.getElementById("alumniName").value;

const email=document.getElementById("alumniEmail").value;

const department=document.getElementById("alumniDepartment").value;

const status=document.getElementById("alumniStatus").value;

const badge=status==="Active"
?'<span class="active-status">Active</span>'
:'<span class="inactive-status">Inactive</span>';

if(editRow){

editRow.cells[1].textContent=name;

editRow.cells[2].textContent=email;

editRow.cells[3].textContent=department;

editRow.cells[4].innerHTML=badge;

alert("Alumni updated successfully!");

}else{

const row=tableBody.insertRow();

row.innerHTML=`

<td>${nextId++}</td>

<td>${name}</td>

<td>${email}</td>

<td>${department}</td>

<td>${badge}</td>

<td>

<button class="edit-btn">

<i class="fa-solid fa-pen"></i>

Edit

</button>

<button class="delete-btn">

<i class="fa-solid fa-trash"></i>

Delete

</button>

</td>

`;

document.getElementById("totalAlumni").textContent++;

alert("New Alumni Added Successfully!");

}

closePopup();

attachButtons();

});

// ==============================
// Attach Edit/Delete Buttons
// ==============================

function attachButtons(){

document.querySelectorAll(".edit-btn").forEach(btn=>{

btn.onclick=function(){

editRow=this.closest("tr");

document.getElementById("alumniName").value=editRow.cells[1].textContent;

document.getElementById("alumniEmail").value=editRow.cells[2].textContent;

document.getElementById("alumniDepartment").value=editRow.cells[3].textContent;

document.getElementById("alumniStatus").value=

editRow.cells[4].textContent.trim();

addModal.style.display="block";

};

});

document.querySelectorAll(".delete-btn").forEach(btn=>{

btn.onclick=function(){

if(confirm("Delete this alumni?")){

this.closest("tr").remove();

document.getElementById("totalAlumni").textContent--;

}

};

});

}

// ==============================
// ESC Key
// ==============================

document.addEventListener("keydown",function(e){

if(e.key==="Escape"){

closePopup();

}

});

console.log("Admin Dashboard Upgraded Successfully");

// ==============================
// Quick Action Cards
// ==============================

document.querySelectorAll(".quick-card").forEach(card => {

    card.addEventListener("click", function () {

        const title = this.querySelector("h3").textContent.trim();

        switch (title) {

            case "Add Alumni":
                addBtn.click();
                break;

            case "Post Job":
                alert("Post Job feature will be added after backend integration.");
                break;

            case "Create Event":
                alert("Create Event feature will be added after backend integration.");
                break;

            case "Announcement":
                alert("Announcement feature will be added after backend integration.");
                break;

            default:
                alert("Feature coming soon.");
        }

    });

});