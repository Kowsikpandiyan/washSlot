// =========================================
// WashSlot API Configuration & Client
// =========================================

// Automatically switch between Local and Production
const API_BASE_URL =
  window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api/bookings"
    : "https://washslot-9v02.onrender.com/api/bookings";

/**
 * Fetch Today's Bookings
 * @param {string} hostel
 * @param {string} [date]
 */
async function getTodayBookings(hostel, date) {
  try {
    let url = `${API_BASE_URL}/today?hostel=${encodeURIComponent(hostel)}`;

    if (date) {
      url += `&date=${encodeURIComponent(date)}`;
    }

    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("API Error - getTodayBookings:", error);

    return {
      success: false,
      message: "Unable to connect to the WashSlot server.",
      bookings: []
    };
  }
}

/**
 * Create Booking
 * @param {Object} bookingData
 */
async function createBooking(bookingData) {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bookingData)
    });

    return await response.json();
  } catch (error) {
    console.error("API Error - createBooking:", error);

    return {
      success: false,
      message: "Failed to connect to booking server."
    };
  }
}

/**
 * Monthly Report
 * @param {string} hostel
 * @param {number|string} month
 * @param {number|string} year
 */
async function getMonthlyReport(hostel, month, year) {
  try {
    const url =
      `${API_BASE_URL}/report?hostel=${encodeURIComponent(hostel)}` +
      `&month=${month}&year=${year}`;

    const response = await fetch(url);

    return await response.json();
  } catch (error) {
    console.error("API Error - getMonthlyReport:", error);

    return {
      success: false,
      report: [],
      message: "Unable to load monthly report."
    };
  }
}

/**
 * Search by Register Number
 * @param {string} registerNo
 * @param {string} hostel
 */
async function searchRegister(registerNo, hostel) {
  try {
    let url =
      `${API_BASE_URL}/search?registerNo=${encodeURIComponent(registerNo)}`;

    if (hostel) {
      url += `&hostel=${encodeURIComponent(hostel)}`;
    }

    const response = await fetch(url);

    return await response.json();
  } catch (error) {
    console.error("API Error - searchRegister:", error);

    return {
      success: false,
      bookings: []
    };
  }
}

/**
 * Dashboard Statistics
 * @param {string} hostel
 */
async function getStatistics(hostel) {
  try {
    const url =
      `${API_BASE_URL}/stats?hostel=${encodeURIComponent(hostel)}`;

    const response = await fetch(url);

    return await response.json();
  } catch (error) {
    console.error("API Error - getStatistics:", error);

    return {
      success: false
    };
  }
}