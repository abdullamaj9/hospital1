// ===================== لوحة الإدارة - admin.js =====================

const ADMIN_CREDENTIALS = { username: "admin", password: "almousa2026" };
const STORAGE_KEYS = { bookings: "almousa_bookings", messages: "almousa_messages", session: "almousa_admin_session" };

// ---------- Helpers ----------
function getBookings() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.bookings)) || []; }
  catch { return []; }
}
function saveBookings(list) { localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(list)); }

function getMessages() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.messages)) || []; }
  catch { return []; }
}
function saveMessages(list) { localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(list)); }

function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "toast show" + (isError ? " error" : "");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("ar-AE", { year: "numeric", month: "short", day: "numeric" });
}

// ---------- تسجيل الدخول ----------
function setupLogin() {
  const loginScreen = document.getElementById("loginScreen");
  const adminWrap = document.getElementById("adminWrap");
  const form = document.getElementById("loginForm");

  if (sessionStorage.getItem(STORAGE_KEYS.session) === "true") {
    loginScreen.style.display = "none";
    adminWrap.style.display = "grid";
    initDashboard();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = document.getElementById("loginUser").value.trim();
    const pass = document.getElementById("loginPass").value;
    if (user === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
      sessionStorage.setItem(STORAGE_KEYS.session, "true");
      loginScreen.style.display = "none";
      adminWrap.style.display = "grid";
      initDashboard();
    } else {
      showToast("بيانات تسجيل الدخول غير صحيحة", true);
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem(STORAGE_KEYS.session);
    location.reload();
  });
}

// ---------- التنقل بين الصفحات ----------
function setupNav() {
  const items = document.querySelectorAll(".nav-item");
  items.forEach(item => {
    item.addEventListener("click", () => {
      items.forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      document.querySelectorAll(".admin-view").forEach(v => v.classList.remove("active"));
      document.getElementById(`view-${item.dataset.view}`).classList.add("active");
    });
  });
}

// ---------- نظرة عامة ----------
function renderOverview() {
  const bookings = getBookings();
  const messages = getMessages();

  document.getElementById("kpiTotalBookings").textContent = bookings.length;
  document.getElementById("kpiNewBookings").textContent = bookings.filter(b => b.status === "جديد").length;
  document.getElementById("kpiMessages").textContent = messages.length;
  document.getElementById("kpiDoctors").textContent = DOCTORS.length;
  document.getElementById("kpiDepartments").textContent = DEPARTMENTS.length;

  // أكثر الأقسام طلباً
  const counts = {};
  bookings.forEach(b => { counts[b.deptName] = (counts[b.deptName] || 0) + 1; });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = sorted.length ? sorted[0][1] : 1;

  const chart = document.getElementById("topDeptsChart");
  if (sorted.length === 0) {
    chart.innerHTML = '<p class="empty-state">لا توجد بيانات حجوزات كافية بعد.</p>';
  } else {
    chart.innerHTML = sorted.map(([name, count]) => `
      <div class="bar-row">
        <span class="bar-label">${name}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${(count / max) * 100}%"></div></div>
        <span class="bar-value">${count}</span>
      </div>
    `).join("");
  }

  // آخر الحجوزات
  const recent = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const tbody = document.querySelector("#recentBookingsTable tbody");
  if (recent.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-state">لا توجد حجوزات حتى الآن.</td></tr>`;
  } else {
    tbody.innerHTML = recent.map(b => `
      <tr>
        <td>${b.id}</td>
        <td>${b.name}</td>
        <td>${b.deptName}</td>
        <td>${b.doctorName}</td>
        <td>${b.date}</td>
        <td>${b.time}</td>
        <td><span class="status-badge status-${b.status}">${b.status}</span></td>
      </tr>
    `).join("");
  }
}

// ---------- الحجوزات ----------
function renderBookings() {
  const filter = document.getElementById("bookingStatusFilter").value;
  const bookings = getBookings().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);
  const tbody = document.querySelector("#bookingsTable tbody");
  const emptyEl = document.getElementById("bookingsEmpty");

  if (filtered.length === 0) {
    tbody.innerHTML = "";
    emptyEl.style.display = "block";
    return;
  }
  emptyEl.style.display = "none";

  tbody.innerHTML = filtered.map(b => `
    <tr data-id="${b.id}">
      <td>${b.id}</td>
      <td>${b.name}</td>
      <td>${b.phone}</td>
      <td>${b.deptName}</td>
      <td>${b.doctorName}</td>
      <td>${b.date}</td>
      <td>${b.time}</td>
      <td>${b.source || "-"}</td>
      <td><span class="status-badge status-${b.status}">${b.status}</span></td>
      <td class="row-actions">
        <select data-action="status">
          <option value="جديد" ${b.status === "جديد" ? "selected" : ""}>جديد</option>
          <option value="مؤكد" ${b.status === "مؤكد" ? "selected" : ""}>مؤكد</option>
          <option value="مكتمل" ${b.status === "مكتمل" ? "selected" : ""}>مكتمل</option>
          <option value="ملغى" ${b.status === "ملغى" ? "selected" : ""}>ملغى</option>
        </select>
        <button class="btn btn-danger btn-sm" data-action="delete">حذف</button>
      </td>
    </tr>
  `).join("");

  // تحديث الحالة
  tbody.querySelectorAll('select[data-action="status"]').forEach(sel => {
    sel.addEventListener("change", () => {
      const id = sel.closest("tr").dataset.id;
      const list = getBookings();
      const idx = list.findIndex(b => b.id === id);
      if (idx > -1) {
        list[idx].status = sel.value;
        saveBookings(list);
        showToast("تم تحديث حالة الحجز");
        renderBookings();
        renderOverview();
      }
    });
  });

  // حذف
  tbody.querySelectorAll('button[data-action="delete"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.closest("tr").dataset.id;
      if (!confirm("هل أنت متأكد من حذف هذا الحجز؟")) return;
      const list = getBookings().filter(b => b.id !== id);
      saveBookings(list);
      showToast("تم حذف الحجز");
      renderBookings();
      renderOverview();
    });
  });
}

// ---------- الرسائل ----------
function renderMessages() {
  const messages = getMessages().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const tbody = document.querySelector("#messagesTable tbody");
  const emptyEl = document.getElementById("messagesEmpty");

  if (messages.length === 0) {
    tbody.innerHTML = "";
    emptyEl.style.display = "block";
    return;
  }
  emptyEl.style.display = "none";

  tbody.innerHTML = messages.map(m => `
    <tr data-id="${m.id}">
      <td>${m.name}</td>
      <td>${m.phone}</td>
      <td>${m.subject}</td>
      <td style="white-space:normal; max-width:280px;">${m.message}</td>
      <td>${formatDate(m.createdAt)}</td>
      <td><button class="btn btn-danger btn-sm" data-action="delete">حذف</button></td>
    </tr>
  `).join("");

  tbody.querySelectorAll('button[data-action="delete"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.closest("tr").dataset.id;
      if (!confirm("هل أنت متأكد من حذف هذه الرسالة؟")) return;
      const list = getMessages().filter(m => m.id !== id);
      saveMessages(list);
      showToast("تم حذف الرسالة");
      renderMessages();
      renderOverview();
    });
  });
}

// ---------- الأطباء ----------
function renderDoctorsAdmin() {
  const tbody = document.getElementById("doctorsTableBody");
  tbody.innerHTML = DOCTORS.map(doc => {
    const dept = DEPARTMENTS.find(d => d.id === doc.dept);
    return `
    <tr>
      <td>${doc.name}</td>
      <td>${doc.title}</td>
      <td>${dept ? dept.icon + " " + dept.name : doc.dept}</td>
      <td>${doc.exp} سنة</td>
      <td>${doc.fee} د.إ</td>
      <td>${doc.duration} دقيقة</td>
    </tr>`;
  }).join("");
}

// ---------- الأقسام ----------
function renderDepartmentsAdmin() {
  const grid = document.getElementById("deptAdminGrid");
  grid.innerHTML = DEPARTMENTS.map(dept => `
    <div class="dept-admin-card">
      <div class="dept-icon">${dept.icon}</div>
      <h4>${dept.name}</h4>
    </div>
  `).join("");
}

// ---------- تهيئة اللوحة ----------
function initDashboard() {
  setupNav();
  renderOverview();
  renderBookings();
  renderMessages();
  renderDoctorsAdmin();
  renderDepartmentsAdmin();

  document.getElementById("bookingStatusFilter").addEventListener("change", renderBookings);
}

document.addEventListener("DOMContentLoaded", setupLogin);
