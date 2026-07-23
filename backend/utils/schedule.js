// ===============================================
// WashSlot - Laundry Schedule Utility
// ===============================================

// Monday - Saturday Schedule
const weekdaySchedule = [
    {
        id: 1,
        session: "Morning",
        time: "6:30 AM - 7:30 AM"
    },
    {
        id: 2,
        session: "Evening Session 1",
        time: "5:30 PM - 6:30 PM"
    },
    {
        id: 3,
        session: "Evening Session 2",
        time: "6:30 PM - 7:30 PM"
    }
];

// Sunday Schedule (10 Fixed Slots)
const sundaySchedule = [
    { id: 1, session: "Slot 1", time: "08:00 AM - 09:00 AM" },
    { id: 2, session: "Slot 2", time: "09:00 AM - 10:00 AM" },
    { id: 3, session: "Slot 3", time: "10:00 AM - 11:00 AM" },
    { id: 4, session: "Slot 4", time: "11:00 AM - 12:00 PM" },
    { id: 5, session: "Slot 5", time: "12:00 PM - 01:00 PM" },
    { id: 6, session: "Slot 6", time: "01:00 PM - 02:00 PM" },
    { id: 7, session: "Slot 7", time: "02:00 PM - 03:00 PM" },
    { id: 8, session: "Slot 8", time: "03:00 PM - 04:00 PM" },
    { id: 9, session: "Slot 9", time: "04:00 PM - 05:00 PM" },
    { id: 10, session: "Slot 10", time: "05:00 PM - 06:00 PM" }
];

// Return today's schedule
const getTodaySchedule = () => {

    const today = new Date();

    const day = today.getDay();

    // Sunday = 0
    if (day === 0) {
        return sundaySchedule;
    }

    return weekdaySchedule;
};

module.exports = {
    weekdaySchedule,
    sundaySchedule,
    getTodaySchedule
};