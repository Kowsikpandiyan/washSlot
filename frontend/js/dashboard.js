// ====================================================
// WashSlot – Dashboard & Smart Session Timing Logic
// ====================================================

// Check selected hostel
const currentHostel = localStorage.getItem("hostel");

if (!currentHostel) {
  window.location.href = "index.html";
}

const TOTAL_MACHINES = 1;
let currentBookingsMap = new Map();
let isSubmitting = false;
let pollingTimer = null;

// Laundry Sessions definition according to Hostel Rules with End Times
const WEEKDAY_SESSIONS = [
  { id: "Morning", title: "Morning Session", time: "6:30 AM – 7:30 AM", endHour: 7, endMin: 30 },
  { id: "Evening Session 1", title: "Evening Session 1", time: "5:30 PM – 6:30 PM", endHour: 18, endMin: 30 },
  { id: "Evening Session 2", title: "Evening Session 2", time: "6:30 PM – 7:30 PM", endHour: 19, endMin: 30 }
];

const SUNDAY_SESSIONS = [
  { id: "Slot 1", title: "Sunday Slot 1", time: "7:00 AM – 8:00 AM", endHour: 8, endMin: 0 },
  { id: "Slot 2", title: "Sunday Slot 2", time: "8:00 AM – 9:00 AM", endHour: 9, endMin: 0 },
  { id: "Slot 3", title: "Sunday Slot 3", time: "9:00 AM – 10:00 AM", endHour: 10, endMin: 0 },
  { id: "Slot 4", title: "Sunday Slot 4", time: "10:00 AM – 11:00 AM", endHour: 11, endMin: 0 },
  { id: "Slot 5", title: "Sunday Slot 5", time: "11:00 AM – 12:00 PM", endHour: 12, endMin: 0 },
  { id: "Slot 6", title: "Sunday Slot 6", time: "12:00 PM – 1:00 PM", endHour: 13, endMin: 0 },
  { id: "Slot 7", title: "Sunday Slot 7", time: "1:00 PM – 2:00 PM", endHour: 14, endMin: 0 },
  { id: "Slot 8", title: "Sunday Slot 8", time: "2:00 PM – 3:00 PM", endHour: 15, endMin: 0 },
  { id: "Slot 9", title: "Sunday Slot 9", time: "3:00 PM – 4:00 PM", endHour: 16, endMin: 0 },
  { id: "Slot 10", title: "Sunday Slot 10", time: "4:00 PM – 5:00 PM", endHour: 17, endMin: 0 }
];

/**
 * Calculate active date, day, and sessions.
 * If today's last session is finished (e.g. past 7:30 PM), automatically shift to TOMORROW!
 */
function getActiveDateAndSchedule() {
  const now = new Date();

  const formatISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const todayDateObj = new Date(now);
  const todayISO = formatISO(todayDateObj);
  const todayDayName = todayDateObj.toLocaleDateString("en-US", { weekday: "long" });

  const todaySessions = (todayDayName === "Sunday") ? SUNDAY_SESSIONS : WEEKDAY_SESSIONS;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const lastSession = todaySessions[todaySessions.length - 1];
  const lastSessionEndMinutes = lastSession.endHour * 60 + lastSession.endMin;

  const isTodayFinished = currentMinutes >= lastSessionEndMinutes;

  if (isTodayFinished) {
    // Tomorrow Calculation
    const tomorrowDateObj = new Date(now);
    tomorrowDateObj.setDate(tomorrowDateObj.getDate() + 1);

    const tomorrowISO = formatISO(tomorrowDateObj);
    const tomorrowDayName = tomorrowDateObj.toLocaleDateString("en-US", { weekday: "long" });
    const tomorrowSessions = (tomorrowDayName === "Sunday") ? SUNDAY_SESSIONS : WEEKDAY_SESSIONS;

    return {
      activeISO: tomorrowISO,
      activeDay: tomorrowDayName,
      activeSessions: tomorrowSessions,
      isTomorrow: true
    };
  }

  return {
    activeISO: todayISO,
    activeDay: todayDayName,
    activeSessions: todaySessions,
    isTomorrow: false
  };
}

let currentSchedule = getActiveDateAndSchedule();

document.addEventListener("DOMContentLoaded", () => {
  // Populate Header & Info
  updateHeaderInfo();

  renderScheduleSummary();
  fetchAndRenderBookings();

  // Setup Auto Refresh (every 5 seconds)
  pollingTimer = setInterval(() => {
    // Recalculate schedule in case time passed last session threshold
    const updatedSchedule = getActiveDateAndSchedule();
    if (updatedSchedule.activeISO !== currentSchedule.activeISO) {
      currentSchedule = updatedSchedule;
      updateHeaderInfo();
      renderScheduleSummary();
    }
    fetchAndRenderBookings(true);
  }, 5000);

  // Setup Modal Form Submission
  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", handleBookingSubmit);
  }

  // Setup Modal Close on Outside Click
  const modal = document.getElementById("bookingModal");
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
});

function updateHeaderInfo() {
  document.getElementById("hostelName").innerText = currentHostel;
  document.getElementById("currentDate").innerText = currentSchedule.activeISO;
  
  let dayLabel = currentSchedule.activeDay;
  if (currentSchedule.isTomorrow) {
    dayLabel += " (Tomorrow)";
  }
  document.getElementById("currentDay").innerText = dayLabel;

  // Render Rollover Banner if active date is tomorrow
  let bannerElem = document.getElementById("rolloverBanner");
  if (currentSchedule.isTomorrow) {
    if (!bannerElem) {
      bannerElem = document.createElement("div");
      bannerElem.id = "rolloverBanner";
      bannerElem.className = "rollover-banner";
      const infoSection = document.querySelector(".info-section");
      if (infoSection) infoSection.parentNode.insertBefore(bannerElem, infoSection);
    }
    bannerElem.innerHTML = `
      <span>🌙 Today's sessions are closed. Now showing <strong>Tomorrow's Schedule (${currentSchedule.activeISO})</strong> for advance booking.</span>
    `;
  } else if (bannerElem) {
    bannerElem.remove();
  }
}

// Render top schedule breakdown section
function renderScheduleSummary() {
  const scheduleContainer = document.getElementById("scheduleGrid");
  if (!scheduleContainer) return;

  scheduleContainer.innerHTML = currentSchedule.activeSessions.map(s => `
    <div class="schedule-card">
      <div class="schedule-icon">⏰</div>
      <div class="schedule-info">
        <h4>${s.id}</h4>
        <p>${s.time}</p>
      </div>
    </div>
  `).join("");
}

// Fetch bookings from backend and render machines & slots
async function fetchAndRenderBookings(isSilent = false) {
  const response = await getTodayBookings(currentHostel, currentSchedule.activeISO);

  if (response && response.success) {
    const bookings = response.bookings || [];
    
    // Create map for quick lookup: key = `${session}_${machineNumber}`
    const newMap = new Map();
    bookings.forEach(b => {
      newMap.set(`${b.session}_${b.machineNumber}`, b);
    });

    currentBookingsMap = newMap;
    renderMachineGrid();
    updateStatsCounter(bookings.length);
  } else {
    renderMachineGrid();
    updateStatsCounter(0);
    if (!isSilent) {
      showToast(response.message || "Failed to load bookings from backend server", "error");
    }
  }
}

// Update dashboard statistics header summary
function updateStatsCounter(bookedCount) {
  const totalSlots = currentSchedule.activeSessions.length * TOTAL_MACHINES;
  const availableSlots = Math.max(0, totalSlots - bookedCount);

  const availableCountElem = document.getElementById("availableCount");
  const bookedCountElem = document.getElementById("bookedCount");

  if (availableCountElem) availableCountElem.innerText = availableSlots;
  if (bookedCountElem) bookedCountElem.innerText = bookedCount;
}

// Render slots grouped by session
function renderMachineGrid() {
  const container = document.getElementById("machineContainer");
  if (!container) return;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let html = "";

  currentSchedule.activeSessions.forEach(session => {
    const sessionEndMinutes = session.endHour * 60 + session.endMin;
    
    // Session is closed if viewing TODAY and current time has passed session end time
    const isSessionClosed = !currentSchedule.isTomorrow && (currentMinutes >= sessionEndMinutes);

    html += `
      <div class="session-block ${isSessionClosed ? 'session-closed-block' : ''}">
        <div class="session-header">
          <span class="session-title">🗓️ ${session.id}</span>
          <span class="session-time-badge ${isSessionClosed ? 'badge-closed' : ''}">
            ${session.time} ${isSessionClosed ? '• (Ended)' : ''}
          </span>
        </div>
        <div class="machine-grid">
    `;

    for (let machine = 1; machine <= TOTAL_MACHINES; machine++) {
      const key = `${session.id}_${machine}`;
      const booking = currentBookingsMap.get(key);

      if (isSessionClosed) {
        // SESSION CLOSED DISPLAY
        html += `
          <div class="machine-card closed">
            <div class="card-top">
              <span class="machine-badge">Washing Machine</span>
              <span class="status-pill status-closed">🔒 CLOSED</span>
            </div>
            <div class="available-info">
              <p>Time for this session has ended.</p>
            </div>
            <button class="btn btn-disabled" disabled>Session Ended</button>
          </div>
        `;
      } else if (booking) {
        // BOOKED SLOT DISPLAY
        html += `
          <div class="machine-card booked">
            <div class="card-top">
              <span class="machine-badge">Washing Machine</span>
              <span class="status-pill status-booked">🔴 BOOKED</span>
            </div>
            <div class="booking-details">
              <p class="student-name">👤 ${escapeHtml(booking.name)}</p>
              <div class="detail-grid">
                <span><strong>Reg No:</strong> ${escapeHtml(booking.registerNo)}</span>
                <span><strong>Room:</strong> ${escapeHtml(booking.roomNo)}</span>
                <span class="dept-span"><strong>Dept:</strong> ${escapeHtml(booking.department)}</span>
              </div>
            </div>
            <button class="btn btn-disabled" disabled>Slot Booked</button>
          </div>
        `;
      } else {
        // AVAILABLE SLOT DISPLAY
        html += `
          <div class="machine-card available">
            <div class="card-top">
              <span class="machine-badge">Washing Machine</span>
              <span class="status-pill status-available">🟢 AVAILABLE</span>
            </div>
            <div class="available-info">
              <p>Washing Machine Ready</p>
            </div>
            <button class="btn btn-primary" onclick="openBookingModal(${machine}, '${escapeJsQuotes(session.id)}')">
              Book Slot
            </button>
          </div>
        `;
      }
    }

    html += `
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Open Booking Popup Modal
function openBookingModal(machineNumber, sessionId) {
  const modal = document.getElementById("bookingModal");
  if (!modal) return;

  document.getElementById("modalHostel").value = currentHostel;
  document.getElementById("modalMachine").value = `Machine ${machineNumber}`;
  document.getElementById("modalSession").value = sessionId;
  document.getElementById("modalDate").value = currentSchedule.activeISO;

  // Store raw machine number and session for form submit
  modal.dataset.machineNumber = machineNumber;
  modal.dataset.sessionId = sessionId;

  // Reset inputs
  document.getElementById("inputName").value = "";
  document.getElementById("inputRegisterNo").value = "";
  document.getElementById("inputDepartment").value = "";
  document.getElementById("inputRoomNo").value = "";

  modal.classList.add("active");
  document.getElementById("inputName").focus();
}

// Close Booking Modal
function closeModal() {
  const modal = document.getElementById("bookingModal");
  if (modal) {
    modal.classList.remove("active");
  }
}

// Handle Form Submit
async function handleBookingSubmit(e) {
  e.preventDefault();
  if (isSubmitting) return;

  const modal = document.getElementById("bookingModal");
  const machineNumber = parseInt(modal.dataset.machineNumber, 10);
  const session = modal.dataset.sessionId;

  const name = document.getElementById("inputName").value.trim();
  const registerNo = document.getElementById("inputRegisterNo").value.trim();
  const department = document.getElementById("inputDepartment").value.trim();
  const roomNo = document.getElementById("inputRoomNo").value.trim();

  if (!name || !registerNo || !department || !roomNo) {
    showToast("Please fill in all required fields.", "error");
    return;
  }

  isSubmitting = true;
  const submitBtn = document.getElementById("submitBookingBtn");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = "Booking Slot...";
  }

  const payload = {
    hostel: currentHostel,
    bookingDate: currentSchedule.activeISO,
    day: currentSchedule.activeDay,
    session,
    machineNumber,
    name,
    registerNo,
    department,
    roomNo
  };

  const response = await createBooking(payload);

  isSubmitting = false;
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerText = "Confirm Booking";
  }

  if (response && response.success) {
    showToast("🎉 Booking Confirmed Successfully!", "success");
    closeModal();
    fetchAndRenderBookings();
  } else {
    showToast(response.message || "This slot is already booked.", "error");
    fetchAndRenderBookings();
  }
}

// Change Hostel handler
function changeHostel() {
  localStorage.removeItem("hostel");
  window.location.href = "index.html";
}

// Toast notification helper
function showToast(message, type = "info") {
  let toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toastContainer";
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-message">${escapeHtml(message)}</span>
    <span class="toast-close" onclick="this.parentElement.remove()">&times;</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Utility functions
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeJsQuotes(str) {
  if (!str) return "";
  return String(str).replace(/'/g, "\\'");
}