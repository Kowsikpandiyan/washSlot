// =========================================
// WashSlot API Configuration & Client
// =========================================

// Configurable API Base URL (Local Node Server or Render Production API)
// Automatically handles file:// protocol when opening HTML files directly
const isLocal = !window.location.hostname || 
                window.location.hostname === "localhost" || 
                window.location.hostname === "127.0.0.1" || 
                window.location.protocol === "file:";

const API_BASE_URL = window.WASH_SLOT_API_URL || 
  (isLocal ? "http://localhost:5000/api/bookings" : "/api/bookings");

/**
 * Fetch Today's Bookings for a given Hostel
 * @param {string} hostel - "Hostel 1" or "Hostel 2"
 * @param {string} [date] - Optional date ISO string (YYYY-MM-DD)
 */
async function getTodayBookings(hostel, date) {
  try {
    let url = `${API_BASE_URL}/today?hostel=${encodeURIComponent(hostel)}`;
    if (date) {
      url += `&date=${encodeURIComponent(date)}`;
    }
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error - getTodayBookings:", error);
    return {
      success: false,
      message: "Unable to connect to backend server at http://localhost:5000",
      bookings: []
    };
  }
}

/**
 * Create a new slot booking
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
      message: "Failed to connect to the booking server."
    };
  }
}

/**
 * Fetch Monthly Booking Report
 * @param {string} hostel 
 * @param {number|string} month 
 * @param {number|string} year 
 */
async function getMonthlyReport(hostel, month, year) {
  try {
    const url = `${API_BASE_URL}/report?hostel=${encodeURIComponent(hostel)}&month=${month}&year=${year}`;
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("API Error - getMonthlyReport:", error);
    return {
      success: false,
      message: "Network error loading report.",
      report: []
    };
  }
}

/**
 * Search Bookings by Register Number
 * @param {string} registerNo 
 * @param {string} [hostel] 
 */
async function searchRegister(registerNo, hostel) {
  try {
    let url = `${API_BASE_URL}/search?registerNo=${encodeURIComponent(registerNo)}`;
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
 * Fetch Dashboard Statistics
 * @param {string} hostel 
 */
async function getStatistics(hostel) {
  try {
    const url = `${API_BASE_URL}/stats?hostel=${encodeURIComponent(hostel)}`;
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("API Error - getStatistics:", error);
    return {
      success: false
    };
  }
}