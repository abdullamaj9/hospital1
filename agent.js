// ===================== منطق إيجنت واتساب الذكي - مستشفى الموسي التخصصي =====================
// يدعم: العربية/الإنجليزية + ردود بأزرار (options) بجانب النص

const {
  DEPARTMENTS,
  DOCTORS,
  TIME_SLOTS,
  HOSPITAL_INFO,
  deptName,
  doctorName,
  doctorTitle,
  hospitalName,
  hospitalAddress,
  hospitalHours,
} = require("./data");
const store = require("./store");
const { sendMessage, sendLocation } = require("./ultramsg");
const { t } = require("./i18n");

const RECEPTION_PHONE = process.env.RECEPTION_PHONE || "971509788772";

// ===================== أدوات مساعدة =====================

function findDeptByIndex(text) {
  const num = parseInt(text.trim(), 10);
  if (isNaN(num)) return null;
  return DEPARTMENTS[num - 1] || null;
}

function findDeptById(id) {
  return DEPARTMENTS.find((d) => d.id === id) || null;
}

function findDoctorsByDept(deptId) {
  return DOCTORS.filter((d) => d.dept === deptId);
}

function findDoctorByIndex(text, deptId) {
  const num = parseInt(text.trim(), 10);
  if (isNaN(num)) return null;
  const doctors = findDoctorsByDept(deptId);
  return doctors[num - 1] || null;
}

function findDoctorById(id) {
  return DOCTORS.find((d) => d.id === id) || null;
}

function isValidDate(text) {
  const t = text.trim();
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  const dmy = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
  if (iso.test(t)) return t;
  const m = t.match(dmy);
  if (m) {
    const [, d, mo, y] = m;
    return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return null;
}

function isPastDate(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  return target < today;
}

function genBookingId() {
  return "BK" + Date.now();
}

// تنسيق رد موحّد: نص + أزرار اختيارية + نوع حقل الإدخال (none/text/date)
function reply(text, options = [], inputType = "none") {
  return { text, options, inputType };
}

// ===================== القائمة الرئيسية =====================

function mainMenuOptions(lang) {
  return [
    { label: t(lang, "menu_book"), value: "book" },
    { label: t(lang, "menu_departments"), value: "departments" },
    { label: t(lang, "menu_hours"), value: "hours" },
    { label: t(lang, "menu_location"), value: "location" },
    { label: t(lang, "menu_modify"), value: "modify" },
    { label: t(lang, "menu_cancel"), value: "cancel" },
    { label: t(lang, "menu_availability"), value: "availability" },
    { label: t(lang, "menu_reception"), value: "reception" },
  ];
}

function welcomeMessage(lang) {
  const text = `${t(lang, "welcomeTitle", hospitalName(lang))}\n\n${t(lang, "welcomeIntro")}`;
  return reply(text, mainMenuOptions(lang));
}

function backToMenuOption(lang) {
  return { label: t(lang, "backToMenu"), value: "menu" };
}

function closeChatOption(lang) {
  return { label: t(lang, "closeChat"), value: "close" };
}

// خيارات تُعرض بعد اكتمال عملية (حجز/تعديل/إلغاء): رجوع للقائمة أو إنهاء المحادثة
function completionOptions(lang) {
  return [backToMenuOption(lang), closeChatOption(lang)];
}

// ===================== الأقسام والأطباء =====================

function departmentsOptions(lang) {
  return DEPARTMENTS.map((d) => ({
    label: `${d.icon} ${deptName(d, lang)}`,
    value: `dept:${d.id}`,
  }));
}

function departmentsMessage(lang) {
  const text = t(lang, "departmentsTitle", hospitalName(lang));
  return reply(text, [...departmentsOptions(lang), backToMenuOption(lang)]);
}

function doctorsOptions(deptId, lang) {
  const doctors = findDoctorsByDept(deptId);
  return doctors.map((doc) => ({
    label: `${doctorName(doc, lang)} - ${doctorTitle(doc, lang)}`,
    value: `doctor:${doc.id}`,
  }));
}

function doctorsMessage(dept, lang) {
  const doctors = findDoctorsByDept(dept.id);
  if (doctors.length === 0) {
    return reply(
      lang === "en"
        ? `Sorry, no doctors are currently available in ${deptName(dept, lang)}.`
        : `عذراً، لا يوجد أطباء متاحون حالياً في قسم ${deptName(dept, lang)}.`,
      [backToMenuOption(lang)]
    );
  }
  let text = `${dept.icon} *${deptName(dept, lang)}*\n${t(lang, "doctorsTitle", "")}\n\n`;
  doctors.forEach((doc) => {
    text += `👨‍⚕️ *${doctorName(doc, lang)}*\n${doctorTitle(doc, lang)} - ${t(lang, "expYears", doc.exp)}\n💰 ${t(lang, "feeLabel")}: ${doc.fee} ${t(lang, "currency")} | ⏱ ${t(lang, "durationLabel")}: ${doc.duration} ${t(lang, "minutes")}\n\n`;
  });
  return reply(text.trim(), [...doctorsOptions(dept.id, lang), backToMenuOption(lang)]);
}

// ===================== مواعيد العمل / الموقع =====================

function workingHoursMessage(lang) {
  const text =
    `${t(lang, "workingHoursTitle")}\n\n` +
    `${t(lang, "outpatient")}\n` +
    `${t(lang, "emergency247")}`;
  return reply(text, [{ label: t(lang, "menu_book"), value: "book" }, backToMenuOption(lang)]);
}

function locationMessage(lang) {
  const text =
    `${t(lang, "locationTitle", hospitalName(lang))}\n\n` +
    `${hospitalAddress(lang)}\n` +
    `📞 ${HOSPITAL_INFO.phone}\n` +
    `🚑 ${lang === "en" ? "Emergency" : "الطوارئ"}: ${HOSPITAL_INFO.emergency}\n` +
    `✉️ ${HOSPITAL_INFO.email}\n\n` +
    `${t(lang, "website")}: ${HOSPITAL_INFO.website}`;
  return reply(text, [backToMenuOption(lang)]);
}

// ===================== أوقات الحجز =====================

function timeSlotsOptions(doctorId, date, lang, excludeBookingId = null) {
  return TIME_SLOTS.filter((time) => !store.isSlotTaken(doctorId, date, time, excludeBookingId)).map((time) => ({
    label: time,
    value: `time:${time}`,
  }));
}

// ===================== التحويل لموظف الاستقبال =====================

async function handoffToReception(phone, conversation, reason, lastMessage, lang) {
  conversation.handedOff = true;
  conversation.state = "with_reception";
  store.saveConversation(phone, conversation);

  store.addHandoff({
    id: "HO" + Date.now(),
    phone: store.normalizePhone(phone),
    reason,
    lastMessage: lastMessage || "",
    createdAt: new Date().toISOString(),
    status: "بانتظار الرد",
  });

  const notif =
    `🔔 *تحويل محادثة جديدة - يتطلب تدخل بشري*\n\n` +
    `📱 رقم العميل: ${store.normalizePhone(phone)}\n` +
    `📝 السبب: ${reason}\n` +
    `💬 آخر رسالة: ${lastMessage || "-"}\n\n` +
    `يرجى التواصل مع العميل مباشرة عبر واتساب.`;

  await sendMessage(RECEPTION_PHONE, notif);

  const text = `${t(lang, "handoffMsg")}\n\n${t(lang, "handoffPhoneNote", HOSPITAL_INFO.phone)}`;
  return reply(text, [backToMenuOption(lang)]);
}

// ===================== سير عمل الحجز =====================

async function startBooking(phone, conversation, lang) {
  conversation.state = "booking_dept";
  conversation.data = {};
  store.saveConversation(phone, conversation);
  return reply(t(lang, "chooseDept"), [...departmentsOptions(lang), backToMenuOption(lang)]);
}

async function handleBookingDept(phone, conversation, text, lang) {
  let dept = null;
  if (text.startsWith("dept:")) dept = findDeptById(text.slice(5));
  if (!dept) dept = findDeptByIndex(text);
  if (!dept) {
    return reply(`${t(lang, "invalidDept")}\n\n${t(lang, "chooseDept")}`, [...departmentsOptions(lang), backToMenuOption(lang)]);
  }
  conversation.data.dept = dept.id;
  conversation.state = "booking_doctor";
  store.saveConversation(phone, conversation);
  return doctorSelectMessage(dept, lang, "booking");
}

function doctorSelectMessage(dept, lang, context) {
  const doctors = findDoctorsByDept(dept.id);
  if (doctors.length === 0) {
    return reply(
      lang === "en"
        ? `Sorry, no doctors are currently available in ${deptName(dept, lang)}.`
        : `عذراً، لا يوجد أطباء متاحون حالياً في قسم ${deptName(dept, lang)}.`,
      [backToMenuOption(lang)]
    );
  }
  let text = `${dept.icon} *${deptName(dept, lang)}*\n\n${t(lang, "chooseDoctor")}\n\n`;
  doctors.forEach((doc) => {
    text += `👨‍⚕️ *${doctorName(doc, lang)}* - ${doctorTitle(doc, lang)}\n${t(lang, "expYears", doc.exp)} | 💰 ${doc.fee} ${t(lang, "currency")} | ⏱ ${doc.duration} ${t(lang, "minutes")}\n\n`;
  });
  return reply(text.trim(), [...doctorsOptions(dept.id, lang), backToMenuOption(lang)]);
}

async function handleBookingDoctor(phone, conversation, text, lang) {
  const dept = conversation.data.dept;
  let doctor = null;
  if (text.startsWith("doctor:")) doctor = findDoctorById(text.slice(7));
  if (!doctor) doctor = findDoctorByIndex(text, dept);
  if (!doctor) {
    const deptObj = findDeptById(dept);
    return reply(`${t(lang, "invalidDoctor")}`, [...doctorsOptions(dept, lang), backToMenuOption(lang)]);
  }
  conversation.data.doctorId = doctor.id;
  conversation.data.fee = doctor.fee;
  conversation.state = "booking_date";
  store.saveConversation(phone, conversation);
  return reply(
    `✅ ${lang === "en" ? "Selected" : "اختيارك"}: *${doctorName(doctor, lang)}* (${doctorTitle(doctor, lang)})\n\n${t(lang, "chooseDate")}`,
    [backToMenuOption(lang)],
    "date"
  );
}

async function handleBookingDate(phone, conversation, text, lang) {
  const date = isValidDate(text);
  if (!date) {
    return reply(t(lang, "invalidDate"), [backToMenuOption(lang)], "date");
  }
  if (isPastDate(date)) {
    return reply(t(lang, "pastDate"), [backToMenuOption(lang)], "date");
  }
  conversation.data.date = date;

  const doctor = findDoctorById(conversation.data.doctorId);
  const options = timeSlotsOptions(conversation.data.doctorId, date, lang);

  if (options.length === 0) {
    return reply(t(lang, "allSlotsTaken", doctorName(doctor, lang)), [backToMenuOption(lang)], "date");
  }

  conversation.state = "booking_time";
  store.saveConversation(phone, conversation);

  return reply(`${t(lang, "fieldDate")}: *${date}*\n\n${t(lang, "chooseTime")}`, [...options, backToMenuOption(lang)]);
}

async function handleBookingTime(phone, conversation, text, lang) {
  let time = null;
  if (text.startsWith("time:")) time = text.slice(5);
  else {
    const num = parseInt(text.trim(), 10);
    const options = timeSlotsOptions(conversation.data.doctorId, conversation.data.date, lang);
    if (!isNaN(num) && options[num - 1]) time = options[num - 1].value.slice(5);
  }

  const doctor = findDoctorById(conversation.data.doctorId);

  if (!time || !TIME_SLOTS.includes(time)) {
    const options = timeSlotsOptions(conversation.data.doctorId, conversation.data.date, lang);
    return reply(t(lang, "invalidGeneric"), [...options, backToMenuOption(lang)]);
  }

  if (store.isSlotTaken(conversation.data.doctorId, conversation.data.date, time)) {
    const options = timeSlotsOptions(conversation.data.doctorId, conversation.data.date, lang);
    return reply(t(lang, "slotTaken"), [...options, backToMenuOption(lang)]);
  }

  conversation.data.time = time;
  conversation.state = "booking_name";
  store.saveConversation(phone, conversation);
  return reply(`${t(lang, "fieldTime")}: *${time}*\n\n${t(lang, "enterName")}`, [], "text");
}

async function handleBookingName(phone, conversation, text, lang) {
  const name = text.trim();
  if (name.length < 2) {
    return reply(t(lang, "invalidName"), [], "text");
  }
  conversation.data.name = name;

  if (String(phone).startsWith("web-")) {
    conversation.state = "booking_phone";
    store.saveConversation(phone, conversation);
    return reply(`${t(lang, "fieldName")}: *${name}*\n\n${t(lang, "enterPhone")}`, [], "text");
  }

  conversation.state = "booking_age";
  store.saveConversation(phone, conversation);
  return reply(`${t(lang, "fieldName")}: *${name}*\n\n${t(lang, "enterAge")}`, [], "text");
}

async function handleBookingPhone(phone, conversation, text, lang) {
  const raw = text.trim();
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.length < 7) {
    return reply(t(lang, "invalidPhone"), [], "text");
  }
  conversation.data.contactPhone = raw;
  conversation.state = "booking_age";
  store.saveConversation(phone, conversation);
  return reply(`${t(lang, "fieldPhone")}: *${raw}*\n\n${t(lang, "enterAge")}`, [], "text");
}

async function handleBookingAge(phone, conversation, text, lang) {
  const age = parseInt(text.trim(), 10);
  if (isNaN(age) || age < 0 || age > 120) {
    return reply(t(lang, "invalidAge"), [], "text");
  }
  conversation.data.age = age;
  conversation.state = "booking_gender";
  store.saveConversation(phone, conversation);
  return reply(`${t(lang, "fieldAge")}: *${age}*\n\n${t(lang, "chooseGender")}`, [
    { label: t(lang, "male"), value: "gender:male" },
    { label: t(lang, "female"), value: "gender:female" },
  ]);
}

async function handleBookingGender(phone, conversation, text, lang) {
  const t_ = text.trim().toLowerCase();
  let gender = null;
  if (t_ === "gender:male" || t_ === "1" || t_.includes("ذكر") || t_ === "male") gender = "male";
  else if (t_ === "gender:female" || t_ === "2" || t_.includes("أنث") || t_.includes("انث") || t_ === "female") gender = "female";

  if (!gender) {
    return reply(t(lang, "invalidGeneric"), [
      { label: t(lang, "male"), value: "gender:male" },
      { label: t(lang, "female"), value: "gender:female" },
    ]);
  }
  conversation.data.gender = gender;
  conversation.state = "booking_reason";
  store.saveConversation(phone, conversation);
  const genderLabel = gender === "male" ? t(lang, "male") : t(lang, "female");
  return reply(`${t(lang, "fieldGender")}: *${genderLabel}*\n\n${t(lang, "enterReason")}`, [
    { label: t(lang, "skip"), value: "skip" },
  ], "text");
}

async function handleBookingReason(phone, conversation, text, lang) {
  const reasonText = text.trim();
  conversation.data.reason = reasonText.toLowerCase() === "skip" ? "" : reasonText;
  conversation.state = "booking_confirm";
  store.saveConversation(phone, conversation);

  return bookingSummaryMessage(conversation.data, lang);
}

function bookingSummaryMessage(d, lang) {
  const dept = findDeptById(d.dept);
  const doctor = findDoctorById(d.doctorId);
  const genderLabel = d.gender === "male" ? t(lang, "male") : t(lang, "female");

  let text = `${t(lang, "bookingSummaryTitle")}\n\n`;
  text += `${t(lang, "fieldDept")}: ${deptName(dept, lang)}\n`;
  text += `${t(lang, "fieldDoctor")}: ${doctorName(doctor, lang)}\n`;
  text += `${t(lang, "fieldDate")}: ${d.date}\n`;
  text += `${t(lang, "fieldTime")}: ${d.time}\n`;
  text += `${t(lang, "fieldName")}: ${d.name}\n`;
  if (d.contactPhone) text += `${t(lang, "fieldPhone")}: ${d.contactPhone}\n`;
  text += `${t(lang, "fieldAge")}: ${d.age}\n`;
  text += `${t(lang, "fieldGender")}: ${genderLabel}\n`;
  text += `${t(lang, "fieldReason")}: ${d.reason || "-"}\n`;
  text += `${t(lang, "fieldFee")}: ${d.fee} ${t(lang, "currency")}`;

  return reply(text, [
    { label: t(lang, "confirm"), value: "confirm" },
    { label: t(lang, "cancelAction"), value: "cancel_booking" },
  ]);
}

async function handleBookingConfirm(phone, conversation, text, lang) {
  const t_ = text.trim().toLowerCase();

  if (t_ === "cancel_booking" || t_.includes("إلغاء") || t_.includes("الغاء") || t_ === "cancel") {
    conversation.state = "idle";
    conversation.data = {};
    store.saveConversation(phone, conversation);
    return reply(t(lang, "bookingCancelledMsg"), completionOptions(lang));
  }

  if (t_ !== "confirm" && !t_.includes("تأكيد") && !t_.includes("نعم") && t_ !== "yes" && t_ !== "1") {
    return bookingSummaryMessage(conversation.data, lang);
  }

  const d = conversation.data;

  if (store.isSlotTaken(d.doctorId, d.date, d.time)) {
    conversation.state = "booking_time";
    store.saveConversation(phone, conversation);
    const options = timeSlotsOptions(d.doctorId, d.date, lang);
    return reply(t(lang, "slotTakenLastMoment"), [...options, backToMenuOption(lang)]);
  }

  const dept = findDeptById(d.dept);
  const doctor = findDoctorById(d.doctorId);
  const isWeb = String(phone).startsWith("web-");

  const booking = {
    id: genBookingId(),
    deptId: d.dept,
    deptName: deptName(dept, "ar"),
    doctorId: d.doctorId,
    doctorName: doctorName(doctor, "ar"),
    date: d.date,
    time: d.time,
    name: d.name,
    phone: isWeb ? store.normalizePhone(d.contactPhone || "") : store.normalizePhone(phone),
    age: d.age,
    gender: d.gender,
    reason: d.reason,
    source: isWeb ? "إيجنت الموقع" : "إيجنت واتساب",
    status: "جديد",
    createdAt: new Date().toISOString(),
  };

  store.addBooking(booking);

  conversation.state = "idle";
  conversation.data = {};
  store.saveConversation(phone, conversation);

  const text2 =
    `${t(lang, "bookingConfirmed")}\n\n` +
    `${t(lang, "bookingId")}: *${booking.id}*\n` +
    `${t(lang, "fieldDoctor")}: ${doctorName(doctor, lang)}\n` +
    `${t(lang, "fieldDate")}: ${booking.date}\n` +
    `${t(lang, "fieldTime")}: ${booking.time}\n\n` +
    `${t(lang, "keepBookingId")}`;

  return reply(text2, completionOptions(lang));
}

// ===================== تعديل / إلغاء الموعد =====================

async function startModifyCancel(phone, conversation, action, lang) {
  const bookings = store.findBookingsByPhone(phone);
  if (bookings.length === 0) {
    return reply(t(lang, "noBookingsFound"), mainMenuOptions(lang));
  }

  conversation.state = action === "modify" ? "modify_select" : "cancel_select";
  conversation.data = { bookings: bookings.map((b) => b.id) };
  store.saveConversation(phone, conversation);

  let text = `${t(lang, "yourBookings")}\n\n`;
  bookings.forEach((b) => {
    text += `🔖 ${b.id}\n👨‍⚕️ ${b.doctorName} - ${b.deptName}\n📅 ${b.date} 🕐 ${b.time}\n${t(lang, "statusLabel")}: ${b.status}\n\n`;
  });
  text += action === "modify" ? t(lang, "selectBookingToModify") : t(lang, "selectBookingToCancel");

  const options = bookings.map((b, i) => ({
    label: `${b.id} - ${b.doctorName} (${b.date} ${b.time})`,
    value: `booking:${b.id}`,
  }));

  return reply(text.trim(), [...options, backToMenuOption(lang)]);
}

function bookingIdFromSelection(text, bookingIds) {
  if (text.startsWith("booking:")) {
    const id = text.slice(8);
    return bookingIds.includes(id) ? id : null;
  }
  const num = parseInt(text.trim(), 10);
  if (!isNaN(num) && bookingIds[num - 1]) return bookingIds[num - 1];
  return null;
}

async function handleCancelSelect(phone, conversation, text, lang) {
  const bookingId = bookingIdFromSelection(text, conversation.data.bookings);
  if (!bookingId) {
    return reply(t(lang, "invalidGeneric"), [backToMenuOption(lang)]);
  }
  const booking = store.getBookings().find((b) => b.id === bookingId);
  store.updateBooking(bookingId, { status: "ملغى" });

  conversation.state = "idle";
  conversation.data = {};
  store.saveConversation(phone, conversation);

  const text2 = `${t(lang, "bookingCancelledSuccess", bookingId)}\n(${booking.doctorName} - ${booking.date} ${booking.time})`;
  return reply(text2, completionOptions(lang));
}

async function handleModifySelect(phone, conversation, text, lang) {
  const bookingId = bookingIdFromSelection(text, conversation.data.bookings);
  if (!bookingId) {
    return reply(t(lang, "invalidGeneric"), [backToMenuOption(lang)]);
  }
  conversation.data.modifyBookingId = bookingId;
  conversation.state = "modify_date";
  store.saveConversation(phone, conversation);

  return reply(t(lang, "modifyChooseNewDate"), [backToMenuOption(lang)], "date");
}

async function handleModifyDate(phone, conversation, text, lang) {
  const date = isValidDate(text);
  if (!date) {
    return reply(t(lang, "invalidDate"), [backToMenuOption(lang)], "date");
  }
  if (isPastDate(date)) {
    return reply(t(lang, "pastDate"), [backToMenuOption(lang)], "date");
  }
  conversation.data.newDate = date;

  const bookingId = conversation.data.modifyBookingId;
  const booking = store.getBookings().find((b) => b.id === bookingId);
  const options = timeSlotsOptions(booking.doctorId, date, lang, bookingId);

  if (options.length === 0) {
    return reply(t(lang, "allSlotsTaken", booking.doctorName), [backToMenuOption(lang)], "date");
  }

  conversation.state = "modify_time";
  store.saveConversation(phone, conversation);

  return reply(`${t(lang, "fieldDate")}: *${date}*\n\n${t(lang, "chooseTime")}`, [...options, backToMenuOption(lang)]);
}

async function handleModifyTime(phone, conversation, text, lang) {
  const bookingId = conversation.data.modifyBookingId;
  const booking = store.getBookings().find((b) => b.id === bookingId);
  const newDate = conversation.data.newDate;

  let time = null;
  if (text.startsWith("time:")) time = text.slice(5);
  else {
    const num = parseInt(text.trim(), 10);
    const options = timeSlotsOptions(booking.doctorId, newDate, lang, bookingId);
    if (!isNaN(num) && options[num - 1]) time = options[num - 1].value.slice(5);
  }

  if (!time || !TIME_SLOTS.includes(time)) {
    const options = timeSlotsOptions(booking.doctorId, newDate, lang, bookingId);
    return reply(t(lang, "invalidGeneric"), [...options, backToMenuOption(lang)]);
  }

  if (store.isSlotTaken(booking.doctorId, newDate, time, bookingId)) {
    const options = timeSlotsOptions(booking.doctorId, newDate, lang, bookingId);
    return reply(t(lang, "slotTaken"), [...options, backToMenuOption(lang)]);
  }

  const oldDate = booking.date;
  const oldTime = booking.time;

  store.updateBooking(bookingId, { date: newDate, time, status: "جديد" });

  conversation.state = "idle";
  conversation.data = {};
  store.saveConversation(phone, conversation);

  const text2 =
    `${t(lang, "bookingModifiedSuccess", bookingId)}\n\n` +
    `${t(lang, "from")}: ${oldDate} ${oldTime}\n` +
    `${t(lang, "to")}: *${newDate} ${time}*\n` +
    `${t(lang, "fieldDoctor")}: ${booking.doctorName}`;

  return reply(text2, completionOptions(lang));
}

// ===================== التحقق من التوفر (بدون حجز) =====================

async function startAvailabilityCheck(phone, conversation, lang) {
  conversation.state = "avail_dept";
  conversation.data = {};
  store.saveConversation(phone, conversation);
  return reply(`${t(lang, "availTitle")}\n\n${t(lang, "chooseDept")}`, [...departmentsOptions(lang), backToMenuOption(lang)]);
}

async function handleAvailDept(phone, conversation, text, lang) {
  let dept = null;
  if (text.startsWith("dept:")) dept = findDeptById(text.slice(5));
  if (!dept) dept = findDeptByIndex(text);
  if (!dept) {
    return reply(t(lang, "invalidDept"), [...departmentsOptions(lang), backToMenuOption(lang)]);
  }
  conversation.data.dept = dept.id;
  conversation.state = "avail_doctor";
  store.saveConversation(phone, conversation);
  return reply(t(lang, "chooseDoctor"), [...doctorsOptions(dept.id, lang), backToMenuOption(lang)]);
}

async function handleAvailDoctor(phone, conversation, text, lang) {
  const dept = conversation.data.dept;
  let doctor = null;
  if (text.startsWith("doctor:")) doctor = findDoctorById(text.slice(7));
  if (!doctor) doctor = findDoctorByIndex(text, dept);
  if (!doctor) {
    return reply(t(lang, "invalidDoctor"), [...doctorsOptions(dept, lang), backToMenuOption(lang)]);
  }
  conversation.data.doctorId = doctor.id;
  conversation.state = "avail_date";
  store.saveConversation(phone, conversation);
  return reply(t(lang, "availDateQuestion"), [backToMenuOption(lang)], "date");
}

async function handleAvailDate(phone, conversation, text, lang) {
  const date = isValidDate(text);
  if (!date) {
    return reply(t(lang, "invalidDate"), [backToMenuOption(lang)], "date");
  }
  const doctor = findDoctorById(conversation.data.doctorId);
  const available = TIME_SLOTS.filter((time) => !store.isSlotTaken(conversation.data.doctorId, date, time));

  conversation.state = "idle";
  conversation.data = {};
  store.saveConversation(phone, conversation);

  if (available.length === 0) {
    return reply(t(lang, "availNone", doctorName(doctor, lang), date), mainMenuOptions(lang));
  }

  const text2 = `${t(lang, "availResultsTitle", date)}\n\n` + available.map((tm) => `• ${tm}`).join("\n");
  return reply(text2, [{ label: t(lang, "bookNow"), value: "book" }, backToMenuOption(lang)]);
}

// ===================== الموجه الرئيسي (Router) =====================

async function processMessage(phone, rawText) {
  const conversation = store.getConversation(phone);
  let lang = conversation.lang || "ar";
  const text = String(rawText).trim();
  const tLower = text.toLowerCase();

  conversation.history = conversation.history || [];
  conversation.history.push({ from: "user", text, at: new Date().toISOString() });
  if (conversation.history.length > 50) conversation.history = conversation.history.slice(-50);

  // ----- تبديل اللغة -----
  if (tLower === "lang:en" || tLower === "english" || tLower === "/en") {
    conversation.lang = "en";
    store.saveConversation(phone, conversation);
    return welcomeMessage("en");
  }
  if (tLower === "lang:ar" || tLower === "عربي" || tLower === "/ar") {
    conversation.lang = "ar";
    store.saveConversation(phone, conversation);
    return welcomeMessage("ar");
  }

  // ----- إذا كانت المحادثة محوّلة لموظف -----
  if (conversation.handedOff) {
    if (tLower === "menu" || tLower.includes("القائمة") || tLower.includes("قائمة")) {
      conversation.handedOff = false;
      conversation.state = "idle";
      store.saveConversation(phone, conversation);
      return welcomeMessage(lang);
    }
    return null;
  }

  // ----- العودة للقائمة الرئيسية من أي حالة -----
  if (tLower === "menu" || tLower.includes("القائمة") || tLower === "0") {
    conversation.state = "idle";
    conversation.data = {};
    store.saveConversation(phone, conversation);
    return welcomeMessage(lang);
  }

  // ----- إنهاء المحادثة -----
  if (tLower === "close") {
    conversation.state = "idle";
    conversation.data = {};
    store.saveConversation(phone, conversation);
    return reply(t(lang, "closeChatMsg"), [backToMenuOption(lang)]);
  }

  // ----- التحويل لموظف الاستقبال -----
  if (
    tLower === "reception" ||
    tLower.includes("موظف") ||
    tLower.includes("استقبال") ||
    tLower.includes("بشري") ||
    tLower.includes("reception") ||
    tLower.includes("human")
  ) {
    return await handoffToReception(phone, conversation, "طلب العميل التحدث مع موظف الاستقبال", text, lang);
  }

  // ----- أول رسالة في المحادثة -----
  if (conversation.history.length <= 1 && conversation.state === "idle") {
    // إذا الرسالة الأولى ليست أمراً معروفاً، أرسل الترحيب
    const known = ["book", "departments", "hours", "location", "modify", "cancel", "availability"];
    if (!known.includes(tLower) && !tLower.startsWith("dept:")) {
      store.saveConversation(phone, conversation);
      return welcomeMessage(lang);
    }
  }

  // ----- التوجيه حسب الحالة -----
  switch (conversation.state) {
    case "booking_dept":
      return await handleBookingDept(phone, conversation, text, lang);
    case "booking_doctor":
      return await handleBookingDoctor(phone, conversation, text, lang);
    case "booking_date":
      return await handleBookingDate(phone, conversation, text, lang);
    case "booking_time":
      return await handleBookingTime(phone, conversation, text, lang);
    case "booking_name":
      return await handleBookingName(phone, conversation, text, lang);
    case "booking_phone":
      return await handleBookingPhone(phone, conversation, text, lang);
    case "booking_age":
      return await handleBookingAge(phone, conversation, text, lang);
    case "booking_gender":
      return await handleBookingGender(phone, conversation, text, lang);
    case "booking_reason":
      return await handleBookingReason(phone, conversation, text, lang);
    case "booking_confirm":
      return await handleBookingConfirm(phone, conversation, text, lang);

    case "cancel_select":
      return await handleCancelSelect(phone, conversation, text, lang);

    case "modify_select":
      return await handleModifySelect(phone, conversation, text, lang);
    case "modify_date":
      return await handleModifyDate(phone, conversation, text, lang);
    case "modify_time":
      return await handleModifyTime(phone, conversation, text, lang);

    case "avail_dept":
      return await handleAvailDept(phone, conversation, text, lang);
    case "avail_doctor":
      return await handleAvailDoctor(phone, conversation, text, lang);
    case "avail_date":
      return await handleAvailDate(phone, conversation, text, lang);

    case "idle":
    default:
      return await handleIdleState(phone, conversation, text, tLower, lang);
  }
}

// ===================== معالجة الحالة الخالية (idle) =====================

async function handleIdleState(phone, conversation, text, tLower, lang) {
  // حجز موعد
  if (tLower === "book" || tLower === "1" || tLower.includes("حجز") || tLower.includes("احجز") || tLower.includes("book")) {
    return await startBooking(phone, conversation, lang);
  }

  // الأقسام والأطباء
  if (
    tLower === "departments" ||
    tLower === "2" ||
    tLower.includes("اقسام") ||
    tLower.includes("أقسام") ||
    tLower.includes("اطباء") ||
    tLower.includes("أطباء") ||
    tLower.includes("department") ||
    tLower.includes("doctor")
  ) {
    return departmentsMessage(lang);
  }

  // قسم مباشرة (dept:xxx)
  if (tLower.startsWith("dept:")) {
    const dept = findDeptById(tLower.slice(5));
    if (dept) return doctorsMessage(dept, lang);
  }

  // مواعيد العمل
  if (tLower === "hours" || tLower === "3" || tLower.includes("مواعيد العمل") || tLower.includes("ساعات العمل") || tLower.includes("hours") || tLower.includes("دوام")) {
    return workingHoursMessage(lang);
  }

  // العنوان والموقع
  if (tLower === "location" || tLower === "4" || tLower.includes("عنوان") || tLower.includes("موقع") || tLower.includes("location") || tLower.includes("address") || tLower.includes("اين") || tLower.includes("أين")) {
    const msg = locationMessage(lang);
    setTimeout(() => {
      sendLocation(phone, 25.2117, 55.2789, `${hospitalName(lang)} - ${hospitalAddress(lang)}`);
    }, 1500);
    return msg;
  }

  // تعديل موعد
  if (tLower === "modify" || tLower === "5" || tLower.includes("تعديل") || tLower.includes("modify") || tLower.includes("reschedul")) {
    return await startModifyCancel(phone, conversation, "modify", lang);
  }

  // إلغاء موعد
  if (tLower === "cancel" || tLower === "6" || tLower.includes("الغاء") || tLower.includes("إلغاء") || tLower.includes("cancel")) {
    return await startModifyCancel(phone, conversation, "cancel", lang);
  }

  // التحقق من التوفر
  if (tLower === "availability" || tLower.includes("متاح") || tLower.includes("توفر") || tLower.includes("availab")) {
    return await startAvailabilityCheck(phone, conversation, lang);
  }

  // إذا لم يُفهم الطلب
  if (conversation.unresolvedCount === undefined) conversation.unresolvedCount = 0;
  conversation.unresolvedCount += 1;
  store.saveConversation(phone, conversation);

  if (conversation.unresolvedCount >= 2) {
    conversation.unresolvedCount = 0;
    store.saveConversation(phone, conversation);
    return await handoffToReception(phone, conversation, "لم يتمكن الإيجنت من فهم طلب العميل بعد محاولتين", text, lang);
  }

  return reply(t(lang, "genericError"), mainMenuOptions(lang));
}

module.exports = { processMessage, welcomeMessage };
