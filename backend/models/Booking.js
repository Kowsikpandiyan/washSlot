const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    hostel: {
      type: String,
      required: [true, "Hostel is required"],
      enum: ["Hostel 1", "Hostel 2"]
    },
    bookingDate: {
      type: String,
      required: [true, "Booking date is required"]
    },
    day: {
      type: String,
      required: [true, "Day is required"]
    },
    session: {
      type: String,
      required: [true, "Session is required"]
    },
    machineNumber: {
      type: Number,
      required: [true, "Machine number is required"]
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true
    },
    registerNo: {
      type: String,
      required: [true, "Register number is required"],
      uppercase: true,
      trim: true
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true
    },
    roomNo: {
      type: String,
      required: [true, "Room number is required"],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Enforce unique booking per Hostel + Date + Session + Machine
bookingSchema.index(
  {
    hostel: 1,
    bookingDate: 1,
    session: 1,
    machineNumber: 1
  },
  {
    unique: true
  }
);

module.exports = mongoose.model("Booking", bookingSchema);