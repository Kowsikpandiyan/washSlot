# 🧺 WashSlot – Hostel Laundry Slot Booking System

A complete full-stack web application designed to replace the manual hostel laundry booking register. Students select their hostel, view real-time washing machine slot availability, and book slots instantly with automated duplicate prevention and monthly report exports.

---

## 🌟 Key Features

- **No Authentication Required**: Quick, friction-free booking flow for students.
- **Hostel Data Scoping**: Bookings for **Hostel 1** and **Hostel 2** are completely separated.
- **Hostel Laundry Timings**:
  - **Monday – Saturday**: Morning (6:30 AM – 7:30 AM), Evening Session 1 (5:30 PM – 6:30 PM), Evening Session 2 (6:30 PM – 7:30 PM).
  - **Sunday**: 10 predefined 1-hour time slots.
- **Real-Time 5-Second Auto Sync**: Live polling ensures all students currently viewing the dashboard immediately see newly booked slots without refreshing.
- **Strict Duplicate Prevention**: MongoDB compound unique index and backend validation prevent duplicate bookings for the same Hostel, Date, Session, and Machine.
- **Monthly Analytics & Export**: View monthly booking history, search by Register Number, sort by Date, and download reports in **PDF** or **Excel (.xlsx)** format.
- **Responsive & Modern UI**: Built with a sleek blue, white, and gray theme, glassmorphic cards, smooth modal animations, and Google Fonts (`Outfit` & `Plus Jakarta Sans`).

---

## 📁 1. Project Folder Structure

```
washslot/
├── frontend/
│   ├── index.html         # Hostel selection landing page
│   ├── dashboard.html     # Main laundry slot booking dashboard
│   ├── report.html        # Monthly report & export page
│   ├── css/
│   │   ├── style.css      # Theme variables, reset, landing & toast styles
│   │   ├── dashboard.css  # Dashboard session cards, machine grid & modal
│   │   └── report.css     # Report filters, search & table styles
│   └── js/
│       ├── api.js         # API client & backend endpoint configuration
│       ├── script.js      # Hostel selection & localStorage management
│       ├── dashboard.js   # Slot rendering, popup modal & 5s polling
│       └── report.js      # Monthly report filtering, search, PDF & Excel exports
│
└── backend/
    ├── server.js          # Express app entry point & middleware setup
    ├── .env               # Environment configuration (PORT, MONGODB_URI)
    ├── package.json       # Backend dependencies (express, mongoose, cors, etc.)
    ├── config/
    │   └── db.js          # MongoDB Mongoose connection handler
    ├── models/
    │   └── Booking.js     # Mongoose Booking schema & compound unique index
    ├── routes/
    │   └── bookingRoutes.js # Express API router endpoints
    ├── controllers/
    │   └── bookingController.js # Booking creation, query & report business logic
    └── middleware/
        └── errorHandler.js # Global Express error handling middleware
```

---

## 🛠️ 2. Tech Stack

- **Frontend**: HTML5, CSS3 (Vanilla CSS variables), Vanilla JavaScript (ES6+), jsPDF, SheetJS (XLSX).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB Atlas, Mongoose ODM.
- **Deployment Targets**:
  - **Frontend**: Vercel
  - **Backend**: Render
  - **Database**: MongoDB Atlas

---

## 🚀 3. Quick Start & Local Setup

### Step 1: Clone or Navigate to Project
```bash
cd washslot
```

### Step 2: Backend Setup
```bash
cd backend
npm install
```

Create/update the `backend/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/washslot
NODE_ENV=development
```

Start the backend server:
```bash
npm run dev
# or
npm start
```
The backend will run on `http://localhost:5000`.

### Step 3: Run Frontend
Simply open `frontend/index.html` in your web browser, or serve it using any HTTP server:
```bash
# Example using npx serve or Live Server
npx serve frontend
```

---

## 🔒 4. Booking & Validation Logic

- **Hostel Scoping**: Selecting Hostel 1 or Hostel 2 stores the selection in `localStorage`. All API requests pass `?hostel=Hostel 1` or `?hostel=Hostel 2`.
- **Database Integrity**: The Mongoose schema enforces a compound index:
  ```javascript
  bookingSchema.index(
    { hostel: 1, bookingDate: 1, session: 1, machineNumber: 1 },
    { unique: true }
  );
  ```
- **Validation Rules**:
  1. All fields (`name`, `registerNo`, `department`, `roomNo`) are required.
  2. Past dates are rejected by backend date comparison.
  3. Concurrent duplicate attempts trigger a HTTP `409 Conflict` response with the message: `"This slot is already booked."`

---

## 📊 5. Monthly Report & Export

1. Open `report.html` from the dashboard header.
2. Filter by **Hostel** (Hostel 1 / Hostel 2), **Month** (January–December), and **Year**.
3. Use the search bar for instant filtering by student **Register Number**.
4. Click **Sort by Date** or click the **Date** table header to toggle ascending/descending sorting.
5. Click **Download PDF** to export a styled PDF via `jsPDF` and `AutoTable`.
6. Click **Download Excel** to export a clean `.xlsx` workbook via `SheetJS`.

---

## 🌐 6. Deployment Instructions

### A. Database Deployment (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and whitelist all IP addresses (`0.0.0.0/0`).
3. Copy the Connection String URI (e.g. `mongodb+srv://<username>:<password>@cluster.mongodb.net/washslot?retryWrites=true&w=majority`).

### B. Backend Deployment (Render)
1. Push the code repository to GitHub.
2. Sign in to [Render](https://render.com) and click **New + > Web Service**.
3. Select your repository and set the Root Directory to `backend`.
4. Set Build Command: `npm install` and Start Command: `npm start`.
5. Add Environment Variables:
   - `PORT`: `5000`
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `NODE_ENV`: `production`
6. Deploy and copy your live Render URL (e.g. `https://washslot-api.onrender.com`).

### C. Frontend Deployment (Vercel)
1. In `frontend/js/api.js`, update the backend API endpoint URL:
   ```javascript
   window.WASH_SLOT_API_URL = "https://washslot-api.onrender.com/api/bookings";
   ```
2. Import the `frontend` directory into [Vercel](https://vercel.com).
3. Set Framework Preset to **Other** (Static Site).
4. Deploy! Your app will be live globally with automatic HTTPS.
