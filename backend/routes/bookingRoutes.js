const express = require("express");
const router = express.Router();

const {
  createBooking,
  getTodayBookings,
  getMonthlyReport,
  searchRegister,
  getStatistics,
  deleteBooking
} = require("../controllers/bookingController");

router.post("/", createBooking);
router.get("/today", getTodayBookings);
router.get("/report", getMonthlyReport);
router.get("/search", searchRegister);
router.get("/stats", getStatistics);
router.delete("/:id", deleteBooking);

module.exports = router;