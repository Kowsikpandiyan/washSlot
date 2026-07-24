// ===============================================
// WashSlot - Hostel Selection Logic
// ===============================================


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