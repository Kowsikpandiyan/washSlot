// ===============================================
// WashSlot - Hostel Selection Logic
// ===============================================

document.addEventListener("DOMContentLoaded", () => {
  // If hostel is already selected, visually highlight or offer quick continuation
  const savedHostel = localStorage.getItem("hostel");
  if (savedHostel) {
    const hintElem = document.getElementById("activeHostelHint");
    if (hintElem) {
      hintElem.innerHTML = `Currently active: <strong>${savedHostel}</strong>. Click below to switch or enter.`;
    }
  }
});

function selectHostel(hostelName) {
  if (!hostelName) return;
  localStorage.setItem("hostel", hostelName);
  
  // Add quick smooth transition feedback
  const card = document.querySelector(`.hostel-btn[data-hostel="${hostelName}"]`) || document.activeElement;
  if (card) {
    card.classList.add("selected-anim");
  }

  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 200);
}