// ====================================================
// WashSlot – Monthly Report Logic
// ====================================================

let fullReportData = [];
let sortAscending = true;

document.addEventListener("DOMContentLoaded", () => {
  // Set default filter values based on current date & saved hostel
  const savedHostel = localStorage.getItem("hostel") || "Hostel 1";
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();

  const hostelSelect = document.getElementById("hostelSelect");
  const monthSelect = document.getElementById("monthSelect");
  const yearSelect = document.getElementById("yearSelect");

  if (hostelSelect) {
    hostelSelect.value = savedHostel;
    hostelSelect.disabled = true;
  }
  if (monthSelect) monthSelect.value = String(currentMonth);
  if (yearSelect) yearSelect.value = String(currentYear);

  // Load initial report data
  loadReport();

  // Setup Search Input Event Listener
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", handleSearch);
  }
});

// Fetch monthly report from API
async function loadReport() {
  const hostel = document.getElementById("hostelSelect").value;
  const month = document.getElementById("monthSelect").value;
  const year = document.getElementById("yearSelect").value;

  const tbody = document.querySelector("#reportTable tbody");
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="loading-td">⏳ Loading report data...</td>
      </tr>
    `;
  }

  const response = await getMonthlyReport(hostel, month, year);

  if (response && response.success) {
    fullReportData = response.report || [];

    // Default sort by date ascending
    sortAscending = true;
    sortDataByDate();

    // Reset search input
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.value = "";

    displayTable(fullReportData);
    updateTotalCount(fullReportData.length);
  } else {
    fullReportData = [];
    displayTable([]);
    updateTotalCount(0);
    showToast(response.message || "Failed to load report", "error");
  }
}

// Render Table Rows
function displayTable(data) {
  const tbody = document.querySelector("#reportTable tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!data || data.length === 0) {
    tbody.innerHTML = `
      <tr class="no-records-row">
        <td colspan="7" class="text-center">No booking records found for the selected month.</td>
      </tr>
    `;
    return;
  }

  data.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.className = index % 2 === 0 ? "even-row" : "odd-row";

    tr.innerHTML = `
      <td><span class="date-badge">${escapeHtml(item.bookingDate)}</span></td>
      <td><strong>${escapeHtml(item.session)}</strong></td>
      <td><span class="machine-tag">Washing Machine</span></td>
      <td class="name-td">👤 ${escapeHtml(item.name)}</td>
      <td>${escapeHtml(item.roomNo)}</td>
      <td>${escapeHtml(item.department)}</td>
      <td><span class="regno-badge">${escapeHtml(item.registerNo)}</span></td>
    `;

    tbody.appendChild(tr);
  });
}

// Handle Search Filter by Register Number
function handleSearch(e) {
  const keyword = e.target.value.trim().toLowerCase();

  if (!keyword) {
    displayTable(fullReportData);
    updateTotalCount(fullReportData.length);
    return;
  }

  const filtered = fullReportData.filter(item =>
    item.registerNo && item.registerNo.toLowerCase().includes(keyword)
  );

  displayTable(filtered);
  updateTotalCount(filtered.length);
}

// Sort Report by Date Toggle
function toggleSortByDate() {
  sortAscending = !sortAscending;
  sortDataByDate();

  const sortIcon = document.getElementById("sortDateIcon");
  if (sortIcon) {
    sortIcon.innerText = sortAscending ? "▲" : "▼";
  }

  // Re-apply current search filter if active
  const searchInput = document.getElementById("searchInput");
  const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";

  if (keyword) {
    const filtered = fullReportData.filter(item =>
      item.registerNo && item.registerNo.toLowerCase().includes(keyword)
    );
    displayTable(filtered);
  } else {
    displayTable(fullReportData);
  }
}

function sortDataByDate() {
  fullReportData.sort((a, b) => {
    const dateA = new Date(a.bookingDate);
    const dateB = new Date(b.bookingDate);
    if (sortAscending) {
      return dateA - dateB || a.machineNumber - b.machineNumber;
    } else {
      return dateB - dateA || a.machineNumber - b.machineNumber;
    }
  });
}

// Update total count indicator
function updateTotalCount(count) {
  const countElem = document.getElementById("totalRecordsCount");
  if (countElem) {
    countElem.innerText = `Total Bookings: ${count}`;
  }
}

// Download PDF Report
function downloadPDF() {
  if (!fullReportData || fullReportData.length === 0) {
    showToast("No data available to export to PDF.", "error");
    return;
  }

  const hostel = document.getElementById("hostelSelect").value;
  const monthName = document.getElementById("monthSelect").options[document.getElementById("monthSelect").selectedIndex].text;
  const year = document.getElementById("yearSelect").value;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Document Title Header
  doc.setFontSize(18);
  doc.setTextColor(30, 58, 138); // Blue header
  doc.text("WashSlot – Monthly Laundry Booking Report", 14, 18);

  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text(`Hostel: ${hostel}  |  Period: ${monthName} ${year}  |  Total Records: ${fullReportData.length}`, 14, 26);
  doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 32);

  // Prepare table rows
  const tableRows = fullReportData.map(item => [
    item.bookingDate,
    item.session,
    "Washing Machine",
    item.name,
    item.roomNo,
    item.department,
    item.registerNo
  ]);

  doc.autoTable({
    head: [["Date", "Session", "Washing Machine", "Name", "Room No", "Department", "Register No"]],
    body: tableRows,
    startY: 38,
    theme: "striped",
    headStyles: {
      fillColor: [37, 99, 235], // Vibrant blue header
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [51, 65, 85]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  const filename = `WashSlot_Report_${hostel.replace(/\s+/g, "_")}_${monthName}_${year}.pdf`;
  doc.save(filename);
  showToast(`📄 PDF report saved as "${filename}"`, "success");
}

// Download Excel Report (.xlsx)
function downloadExcel() {
  if (!fullReportData || fullReportData.length === 0) {
    showToast("No data available to export to Excel.", "error");
    return;
  }

  const hostel = document.getElementById("hostelSelect").value;
  const monthName = document.getElementById("monthSelect").options[document.getElementById("monthSelect").selectedIndex].text;
  const year = document.getElementById("yearSelect").value;

  // Format data cleanly for spreadsheet export
  const excelData = fullReportData.map((item, index) => ({
    "S.No": index + 1,
    "Hostel": item.hostel,
    "Date": item.bookingDate,
    "Day": item.day,
    "Session": item.session,
    "Washing Machine": "Washing Machine",
    "Student Name": item.name,
    "Register Number": item.registerNo,
    "Department": item.department,
    "Room Number": item.roomNo,
    "Booking Timestamp": item.createdAt ? new Date(item.createdAt).toLocaleString() : ""
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths for pretty formatting
  worksheet["!cols"] = [
    { wch: 6 },  // S.No
    { wch: 12 }, // Hostel
    { wch: 12 }, // Date
    { wch: 10 }, // Day
    { wch: 18 }, // Session
    { wch: 15 }, // Machine Number
    { wch: 22 }, // Student Name
    { wch: 15 }, // Register Number
    { wch: 20 }, // Department
    { wch: 12 }, // Room Number
    { wch: 22 }  // Timestamp
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Report");

  const filename = `WashSlot_Report_${hostel.replace(/\s+/g, "_")}_${monthName}_${year}.xlsx`;
  XLSX.writeFile(workbook, filename);

  showToast(`📊 Excel report saved as "${filename}"`, "success");
}

// Toast helper
function showToast(message, type = "info") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <span class="toast-close" onclick="this.parentElement.remove()">&times;</span>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}