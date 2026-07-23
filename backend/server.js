const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");

// Load Environment Variables
dotenv.config();

// Database Connection
const connectDB = require("./config/db");

// Routes
const bookingRoutes = require("./routes/bookingRoutes");

// Middleware
const errorHandler = require("./middleware/errorHandler");

// Initialize Express App
const app = express();

// Middleware Setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Health Check / Root Endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    name: "WashSlot API",
    message: "🧺 WashSlot – Hostel Laundry Slot Booking System Backend Running",
    status: "Healthy",
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/bookings", bookingRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route Not Found - [${req.method}] ${req.originalUrl}`
  });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log("========================================");
      console.log("🚀 WashSlot Backend Server Running");
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
      console.log("========================================");
    });
  } catch (error) {
    console.error("❌ Database connection error. Starting server in degraded mode...");
    app.listen(PORT, () => {
      console.log(`🌐 Server running without DB on port ${PORT}`);
    });
  }
};

startServer();