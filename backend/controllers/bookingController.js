const Booking = require("../models/Booking");

// ===============================
// Helper: Get Today's ISO Date (YYYY-MM-DD)
// ===============================
const getTodayISO = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ===============================
// Create Booking
// POST /api/bookings
// ===============================
const createBooking = async (req, res) => {
  try {
    const {
      hostel,
      bookingDate,
      day,
      session,
      machineNumber,
      name,
      registerNo,
      department,
      roomNo
    } = req.body;

    if (
      !hostel ||
      !bookingDate ||
      !day ||
      !session ||
      !machineNumber ||
      !name ||
      !registerNo ||
      !department ||
      !roomNo
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required."
      });
    }

    const todayStr = getTodayISO();

    if (bookingDate < todayStr) {
      return res.status(400).json({
        success: false,
        message: "Past date booking is not allowed."
      });
    }

    // Check if slot is already booked
    const existing = await Booking.findOne({
      hostel,
      bookingDate,
      session,
      machineNumber: Number(machineNumber)
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This slot is already booked."
      });
    }

    const booking = await Booking.create({
      hostel,
      bookingDate,
      day,
      session,
      machineNumber: Number(machineNumber),
      name: name.trim(),
      registerNo: registerNo.trim().toUpperCase(),
      department: department.trim(),
      roomNo: roomNo.trim()
    });

    return res.status(201).json({
      success: true,
      message: "Booking confirmed successfully!",
      booking
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This slot is already booked."
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process booking."
    });
  }
};

// ===============================
// Get Today's Bookings
// GET /api/bookings/today?hostel=Hostel 1
// ===============================
const getTodayBookings = async (req, res) => {
  try {
    const { hostel, date } = req.query;

    if (!hostel) {
      return res.status(400).json({
        success: false,
        message: "Hostel selection is required."
      });
    }

    const queryDate = date || getTodayISO();

    const bookings = await Booking.find({
      hostel,
      bookingDate: queryDate
    }).sort({
      session: 1,
      machineNumber: 1
    });

    return res.json({
      success: true,
      queryDate,
      hostel,
      bookings
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error fetching today's bookings."
    });
  }
};

// ===============================
// Get Monthly Report
// GET /api/bookings/report?hostel=Hostel 1&month=7&year=2026
// ===============================
const getMonthlyReport = async (req, res) => {
  try {
    const { hostel, month, year } = req.query;

    if (!hostel || !month || !year) {
      return res.status(400).json({
        success: false,
        message: "Hostel, Month, and Year are required."
      });
    }

    const formattedMonth = String(month).padStart(2, "0");
    const datePrefix = `${year}-${formattedMonth}`;

    const report = await Booking.find({
      hostel,
      bookingDate: { $regex: `^${datePrefix}` }
    }).sort({
      bookingDate: 1,
      machineNumber: 1
    });

    return res.json({
      success: true,
      hostel,
      month: Number(month),
      year: Number(year),
      totalBookings: report.length,
      report
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error generating monthly report."
    });
  }
};

// ===============================
// Search Register Number
// GET /api/bookings/search?registerNo=23CS101&hostel=Hostel 1
// ===============================
const searchRegister = async (req, res) => {
  try {
    const { registerNo, hostel } = req.query;

    if (!registerNo) {
      return res.status(400).json({
        success: false,
        message: "Register Number is required for searching."
      });
    }

    const filter = {
      registerNo: { $regex: registerNo.trim(), $options: "i" }
    };

    if (hostel) {
      filter.hostel = hostel;
    }

    const bookings = await Booking.find(filter).sort({
      bookingDate: -1
    });

    return res.json({
      success: true,
      bookings
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error searching register number."
    });
  }
};

// ===============================
// Get Booking Statistics
// GET /api/bookings/stats?hostel=Hostel 1
// ===============================
const getStatistics = async (req, res) => {
  try {
    const { hostel } = req.query;
    const todayStr = getTodayISO();

    const filter = { bookingDate: todayStr };
    if (hostel) filter.hostel = hostel;

    const bookedCount = await Booking.countDocuments(filter);

    // Dynamic session count depending on day of week (1 Machine in Hostel)
    const todayDateObj = new Date();
    const dayOfWeek = todayDateObj.toLocaleDateString("en-US", { weekday: "long" });
    const totalSessions = dayOfWeek === "Sunday" ? 10 : 3;
    const totalMachines = 1;
    const maxSlots = totalSessions * totalMachines;

    return res.json({
      success: true,
      today: todayStr,
      day: dayOfWeek,
      hostel: hostel || "All",
      booked: bookedCount,
      totalSlots: maxSlots,
      available: Math.max(0, maxSlots - bookedCount),
      occupancyPercentage: ((bookedCount / maxSlots) * 100).toFixed(1)
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error getting statistics."
    });
  }
};

// ===============================
// Delete Booking
// DELETE /api/bookings/:id
// ===============================
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found."
      });
    }

    return res.json({
      success: true,
      message: "Booking deleted successfully."
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error deleting booking."
    });
  }
};

module.exports = {
  createBooking,
  getTodayBookings,
  getMonthlyReport,
  searchRegister,
  getStatistics,
  deleteBooking
};