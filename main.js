// ===================== مستشفى الموسي التخصصي - main.js =====================

// ---------- تخزين الحجوزات والرسائل محلياً ----------
const STORAGE_KEYS = { bookings: "almousa_bookings", messages: "almousa_messages" };

function getBookings() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.bookings)) || []; }
  catch { return []; }
}
function saveBookings(list) {
  localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(list));
}
function getMessages() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.messages)) || []; }
  catch { return []; }
}
function saveMessages(list) {
  localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(list));
}

// ---------- Toast ----------
function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "toast show" + (isError ? " error" : "");
  setTimeout(() => toast.classList.remove("show"), 3500);
}

// ---------- تعبئة القوائم ----------
function populateDeptSelects() {
  const selects = [document.getElementById("qDept"), document.getElementById("bDept")];
  selects.forEach(sel => {
    if (!sel) return;
    DEPARTMENTS.forEach(dept => {
      const opt = document.createElement("option");
      opt.value = dept.id;
      opt.textContent = `${dept.icon} ${dept.name}`;
      sel.appendChild(opt);
    });
  });
}

function populateDoctorSelect(deptSelectId, doctorSelectId) {
  const deptSel = document.getElementById(deptSelectId);
  const docSel = document.getElementById(doctorSelectId);
  if (!deptSel || !docSel) return;

  deptSel.addEventListener("change", () => {
    docSel.innerHTML = '<option value="">اختر الطبيب</option>';
    const doctors = DOCTORS.filter(d => d.dept === deptSel.value);
    doctors.forEach(doc => {
      const opt = document.createElement("option");
      opt.value = doc.id;
      opt.textContent = `${doc.name} - ${doc.title}`;
      docSel.appendChild(opt);
    });
  });
}

function populateTimeSelects() {
  const selects = [document.getElementById("qTime"), document.getElementById("bTime")];
  selects.forEach(sel => {
    if (!sel) return;
    TIME_SLOTS.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      sel.appendChild(opt);
    });
  });
}

// ---------- عرض الأقسام ----------
function renderDepartments() {
  const grid = document.getElementById("deptGrid");
  if (!grid) return;
  grid.innerHTML = DEPARTMENTS.map(dept => `
    <div class="dept-card" data-dept="${dept.id}">
      <div class="dept-icon">${dept.icon}</div>
      <h4>${dept.name}</h4>
      <p>${dept.desc}</p>
    </div>
  `).join("");

  grid.querySelectorAll(".dept-card").forEach(card => {
    card.addEventListener("click", () => {
      const deptId = card.dataset.dept;
      document.getElementById("doctors").scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        const filterBtn = document.querySelector(`.filter-btn[data-filter="${deptId}"]`);
        if (filterBtn) filterBtn.click();
      }, 400);
    });
  });
}

// ---------- عرض الأطباء ----------
function renderDoctorsFilter() {
  const filterWrap = document.getElementById("doctorsFilter");
  if (!filterWrap) return;
  const usedDepts = [...new Set(DOCTORS.map(d => d.dept))];
  usedDepts.forEach(deptId => {
    const dept = DEPARTMENTS.find(d => d.id === deptId);
    if (!dept) return;
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.dataset.filter = deptId;
    btn.textContent = `${dept.icon} ${dept.name}`;
    filterWrap.appendChild(btn);
  });

  filterWrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    filterWrap.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderDoctors(btn.dataset.filter);
  });
}

function renderDoctors(filter = "all") {
  const grid = document.getElementById("doctorsGrid");
  if (!grid) return;
  const list = filter === "all" ? DOCTORS : DOCTORS.filter(d => d.dept === filter);
  grid.innerHTML = list.map(doc => {
    const dept = DEPARTMENTS.find(d => d.id === doc.dept);
    return `
    <div class="doctor-card">
      <div class="doctor-photo">${dept ? dept.icon : "👨‍⚕️"}</div>
      <div class="doctor-info">
        <h4>${doc.name}</h4>
        <div class="doctor-title">${doc.title}</div>
        <p class="doctor-bio">${doc.bio}</p>
        <div class="doctor-meta">
          <span>الخبرة: <strong>${doc.exp} سنة</strong></span>
          <span>الكشف: <strong>${doc.fee} د.إ</strong></span>
        </div>
        <a href="#booking" class="btn btn-primary btn-sm btn-block doctor-book" data-doc="${doc.id}" data-dept="${doc.dept}">حجز موعد</a>
      </div>
    </div>`;
  }).join("");

  grid.querySelectorAll(".doctor-book").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const deptSel = document.getElementById("bDept");
      const docSel = document.getElementById("bDoctor");
      deptSel.value = btn.dataset.dept;
      deptSel.dispatchEvent(new Event("change"));
      setTimeout(() => { docSel.value = btn.dataset.doc; }, 50);
      document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
    });
  });
}

// ---------- عرض الخدمات ----------
function renderServices() {
  const grid = document.getElementById("servicesGrid");
  if (!grid) return;
  grid.innerHTML = SERVICES.map(s => `
    <div class="service-card">
      <h4>${s.name}</h4>
      <p>${s.desc}</p>
      <div class="service-meta">
        <span>⏱ ${s.duration}</span>
        <span>💰 ${s.price}</span>
      </div>
    </div>
  `).join("");
}

// ---------- الأسئلة الشائعة ----------
function renderFAQ() {
  const list = document.getElementById("faqList");
  if (!list) return;
  list.innerHTML = FAQ.map((item, i) => `
    <div class="faq-item" data-i="${i}">
      <button class="faq-question">
        <span>${item.q}</span>
        <span class="icon">+</span>
      </button>
      <div class="faq-answer"><p>${item.a}</p></div>
    </div>
  `).join("");

  list.querySelectorAll(".faq-item").forEach(item => {
    item.querySelector(".faq-question").addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      list.querySelectorAll(".faq-item").forEach(i => i.classList.remove("open"));
      if (!isOpen) item.classList.add("open");
    });
  });
}

// ---------- الإحصائيات المتحركة ----------
function animateStats() {
  const stats = document.querySelectorAll(".stat-num");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        let current = 0;
        const step = Math.max(1, Math.ceil(target / 60));
        const interval = setInterval(() => {
          current += step;
          if (current >= target) { current = target; clearInterval(interval); }
          el.textContent = current.toLocaleString("ar");
        }, 25);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.4 });
  stats.forEach(s => observer.observe(s));
}

// ---------- التحقق من تعارض المواعيد ----------
function isSlotTaken(doctorId, date, time) {
  const bookings = getBookings();
  return bookings.some(b => b.doctorId === doctorId && b.date === date && b.time === time && b.status !== "ملغى");
}

// ---------- معالجة الحجز ----------
function handleBookingSubmit(formPrefix, sourceLabel) {
  const dept = document.getElementById(`${formPrefix}Dept`).value;
  const doctorId = document.getElementById(`${formPrefix}Doctor`).value;
  const date = document.getElementById(`${formPrefix}Date`).value;
  const time = document.getElementById(`${formPrefix}Time`).value;
  const name = document.getElementById(`${formPrefix}Name`).value.trim();
  const phone = document.getElementById(`${formPrefix}Phone`).value.trim();

  if (!dept || !doctorId || !date || !time || !name || !phone) {
    showToast("يرجى تعبئة جميع الحقول المطلوبة", true);
    return false;
  }

  if (isSlotTaken(doctorId, date, time)) {
    showToast("⚠️ هذا الموعد محجوز مسبقاً لدى هذا الطبيب، يرجى اختيار وقت آخر", true);
    return false;
  }

  const doctor = DOCTORS.find(d => d.id === doctorId);
  const deptObj = DEPARTMENTS.find(d => d.id === dept);

  const booking = {
    id: "BK" + Date.now(),
    deptId: dept,
    deptName: deptObj ? deptObj.name : dept,
    doctorId,
    doctorName: doctor ? doctor.name : doctorId,
    date, time, name, phone,
    email: document.getElementById("bEmail") ? document.getElementById("bEmail").value : "",
    age: document.getElementById("bAge") ? document.getElementById("bAge").value : "",
    gender: document.getElementById("bGender") ? document.getElementById("bGender").value : "",
    reason: document.getElementById("bReason") ? document.getElementById("bReason").value : "",
    source: sourceLabel,
    status: "جديد",
    createdAt: new Date().toISOString(),
  };

  const bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);

  showToast(`✅ تم تأكيد حجزك بنجاح مع ${booking.doctorName} - رقم الحجز: ${booking.id}`);
  return true;
}

// ---------- إعداد النماذج ----------
function setupForms() {
  // أقل تاريخ = اليوم
  const today = new Date().toISOString().split("T")[0];
  ["qDate", "bDate"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.min = today;
  });

  // الحجز السريع
  const quickForm = document.getElementById("quickBookingForm");
  if (quickForm) {
    quickForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const success = handleBookingSubmit("q", "الحجز السريع (الصفحة الرئيسية)");
      if (success) quickForm.reset();
    });
  }

  // الحجز الكامل
  const fullForm = document.getElementById("fullBookingForm");
  if (fullForm) {
    fullForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const success = handleBookingSubmit("b", "نموذج الحجز الكامل");
      if (success) fullForm.reset();
    });
  }

  // نموذج التواصل
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const msg = {
        id: "MSG" + Date.now(),
        name: document.getElementById("cName").value.trim(),
        phone: document.getElementById("cPhone").value.trim(),
        subject: document.getElementById("cSubject").value.trim(),
        message: document.getElementById("cMessage").value.trim(),
        status: "جديد",
        source: "نموذج التواصل",
        createdAt: new Date().toISOString(),
      };
      const messages = getMessages();
      messages.push(msg);
      saveMessages(messages);
      showToast("✅ تم إرسال رسالتك بنجاح، سنتواصل معك قريباً");
      contactForm.reset();
    });
  }
}

// ---------- شريط التنقل المتحرك ----------
function setupNavToggle() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  const actions = document.querySelector(".nav-actions");
  if (!toggle) return;
  toggle.addEventListener("click", () => {
    links.classList.toggle("open");
    actions.classList.toggle("open");
  });
  links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    links.classList.remove("open");
    actions.classList.remove("open");
  }));
}

// ---------- واتساب ----------
function setupWhatsApp() {
  const btn = document.getElementById("whatsappFloat");
  if (!btn) return;
  const phone = "971501234567"; // رقم تجريبي
  const text = encodeURIComponent("السلام عليكم، أود الاستفسار عن حجز موعد في مستشفى الموسي التخصصي.");
  btn.href = `https://wa.me/${phone}?text=${text}`;
  btn.target = "_blank";
}

// ---------- التشغيل ----------
document.addEventListener("DOMContentLoaded", () => {
  populateDeptSelects();
  populateDoctorSelect("qDept", "qDoctor");
  populateDoctorSelect("bDept", "bDoctor");
  populateTimeSelects();
  renderDepartments();
  renderDoctorsFilter();
  renderDoctors();
  renderServices();
  renderFAQ();
  animateStats();
  setupForms();
  setupNavToggle();
  setupWhatsApp();
});
