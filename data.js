// ===================== بيانات مستشفى الموسي التخصصي - إيجنت الواتساب =====================
// يدعم العربية والإنجليزية (nameAr / nameEn)

const DEPARTMENTS = [
  { id: "cardio",        nameAr: "أمراض القلب والشرايين",      nameEn: "Cardiology",          icon: "❤️" },
  { id: "ortho",         nameAr: "جراحة العظام والمفاصل",       nameEn: "Orthopedics",          icon: "🦴" },
  { id: "pediatrics",    nameAr: "طب الأطفال",                  nameEn: "Pediatrics",           icon: "🧒" },
  { id: "obgyn",         nameAr: "النساء والولادة",             nameEn: "Obstetrics & Gynecology", icon: "🤰" },
  { id: "derma",         nameAr: "الجلدية والتجميل",            nameEn: "Dermatology & Cosmetics", icon: "🌿" },
  { id: "dental",        nameAr: "طب وجراحة الأسنان",           nameEn: "Dental Medicine & Surgery", icon: "🦷" },
  { id: "neuro",         nameAr: "الأعصاب والمخ",               nameEn: "Neurology",            icon: "🧠" },
  { id: "ent",           nameAr: "الأنف والأذن والحنجرة",       nameEn: "ENT (Ear, Nose & Throat)", icon: "👂" },
  { id: "ophthalmology", nameAr: "طب وجراحة العيون",            nameEn: "Ophthalmology",        icon: "👁️" },
  { id: "urology",       nameAr: "المسالك البولية",             nameEn: "Urology",              icon: "🩺" },
  { id: "gastro",        nameAr: "الجهاز الهضمي والكبد",        nameEn: "Gastroenterology & Hepatology", icon: "🍃" },
  { id: "endocrine",     nameAr: "الغدد الصماء والسكري",        nameEn: "Endocrinology & Diabetes", icon: "⚗️" },
  { id: "psychiatry",    nameAr: "الطب النفسي",                 nameEn: "Psychiatry",           icon: "🧩" },
  { id: "physio",        nameAr: "العلاج الطبيعي والتأهيل",     nameEn: "Physiotherapy & Rehab", icon: "🏃" },
  { id: "oncology",      nameAr: "الأورام",                     nameEn: "Oncology",             icon: "🎗️" },
  { id: "nutrition",     nameAr: "التغذية العلاجية",            nameEn: "Clinical Nutrition",   icon: "🥗" },
  { id: "general",       nameAr: "الطب العام",                  nameEn: "General Medicine",     icon: "🩹" },
  { id: "lab",           nameAr: "المختبر الطبي",               nameEn: "Medical Laboratory",   icon: "🧪" },
  { id: "radiology",     nameAr: "الأشعة والتصوير الطبي",       nameEn: "Radiology & Imaging",  icon: "📷" },
  { id: "emergency",     nameAr: "الطوارئ",                     nameEn: "Emergency",            icon: "🚑" },
  { id: "surgery",       nameAr: "الجراحة العامة",              nameEn: "General Surgery",      icon: "🔬" },
  { id: "dialysis",      nameAr: "أمراض الكلى والغسيل الكلوي",  nameEn: "Nephrology & Dialysis", icon: "💧" },
];

const DOCTORS = [
  { id:"d1",  nameAr:"د. أحمد المنصوري",   nameEn:"Dr. Ahmed Al Mansoori",  dept:"cardio",        titleAr:"استشاري أمراض القلب",        titleEn:"Cardiology Consultant",            exp:20, fee:300, duration:30 },
  { id:"d2",  nameAr:"د. سارة الزعابي",    nameEn:"Dr. Sara Al Zaabi",      dept:"cardio",        titleAr:"أخصائية قلب وأوعية دموية",   titleEn:"Cardiology Specialist",            exp:12, fee:250, duration:30 },
  { id:"d3",  nameAr:"د. خالد العامري",    nameEn:"Dr. Khalid Al Ameri",    dept:"ortho",         titleAr:"استشاري جراحة العظام",       titleEn:"Orthopedic Surgery Consultant",    exp:18, fee:280, duration:30 },
  { id:"d4",  nameAr:"د. منى الكندي",      nameEn:"Dr. Mona Al Kindi",      dept:"ortho",         titleAr:"أخصائية جراحة العظام",       titleEn:"Orthopedic Surgery Specialist",    exp:9,  fee:220, duration:30 },
  { id:"d5",  nameAr:"د. فاطمة الهاشمي",   nameEn:"Dr. Fatima Al Hashimi",  dept:"pediatrics",    titleAr:"استشارية طب أطفال",          titleEn:"Pediatrics Consultant",            exp:15, fee:200, duration:20 },
  { id:"d6",  nameAr:"د. يوسف النعيمي",    nameEn:"Dr. Yousef Al Naimi",    dept:"pediatrics",    titleAr:"أخصائي طب أطفال",            titleEn:"Pediatrics Specialist",            exp:8,  fee:180, duration:20 },
  { id:"d7",  nameAr:"د. ليلى المطيري",    nameEn:"Dr. Laila Al Mutairi",   dept:"obgyn",         titleAr:"استشارية نساء وولادة",       titleEn:"Obstetrics & Gynecology Consultant", exp:17, fee:300, duration:30 },
  { id:"d8",  nameAr:"د. هند الشامسي",     nameEn:"Dr. Hind Al Shamsi",     dept:"obgyn",         titleAr:"أخصائية نساء وولادة",        titleEn:"Obstetrics & Gynecology Specialist", exp:10, fee:230, duration:30 },
  { id:"d9",  nameAr:"د. عمر الفلاسي",     nameEn:"Dr. Omar Al Falasi",     dept:"derma",         titleAr:"استشاري جلدية وتجميل",       titleEn:"Dermatology & Cosmetics Consultant", exp:14, fee:250, duration:20 },
  { id:"d10", nameAr:"د. ريم البلوشي",     nameEn:"Dr. Reem Al Balushi",    dept:"derma",         titleAr:"أخصائية جلدية",              titleEn:"Dermatology Specialist",           exp:7,  fee:200, duration:20 },
  { id:"d11", nameAr:"د. ماجد الظاهري",    nameEn:"Dr. Majid Al Dhaheri",   dept:"dental",        titleAr:"استشاري طب أسنان وزراعة",    titleEn:"Dental & Implants Consultant",     exp:16, fee:200, duration:30 },
  { id:"d12", nameAr:"د. نورة السويدي",    nameEn:"Dr. Noura Al Suwaidi",   dept:"dental",        titleAr:"أخصائية تقويم أسنان",        titleEn:"Orthodontics Specialist",          exp:9,  fee:180, duration:30 },
  { id:"d13", nameAr:"د. سلطان الكعبي",    nameEn:"Dr. Sultan Al Kaabi",    dept:"neuro",         titleAr:"استشاري أمراض الأعصاب",      titleEn:"Neurology Consultant",             exp:19, fee:320, duration:30 },
  { id:"d14", nameAr:"د. عائشة الرميثي",   nameEn:"Dr. Aisha Al Remeithi",  dept:"neuro",         titleAr:"أخصائية أعصاب",              titleEn:"Neurology Specialist",             exp:11, fee:260, duration:30 },
  { id:"d15", nameAr:"د. طارق اليافعي",    nameEn:"Dr. Tariq Al Yafei",     dept:"ent",           titleAr:"استشاري أنف وأذن وحنجرة",    titleEn:"ENT Consultant",                   exp:13, fee:240, duration:20 },
  { id:"d16", nameAr:"د. هيا الدرمكي",     nameEn:"Dr. Haya Al Darmaki",    dept:"ophthalmology", titleAr:"استشارية طب وجراحة عيون",    titleEn:"Ophthalmology Consultant",         exp:15, fee:270, duration:30 },
  { id:"d17", nameAr:"د. راشد القاسمي",    nameEn:"Dr. Rashed Al Qasimi",   dept:"urology",       titleAr:"استشاري مسالك بولية",        titleEn:"Urology Consultant",               exp:17, fee:290, duration:30 },
  { id:"d18", nameAr:"د. نوف الشحي",       nameEn:"Dr. Nouf Al Shehhi",     dept:"gastro",        titleAr:"استشارية جهاز هضمي وكبد",    titleEn:"Gastroenterology & Hepatology Consultant", exp:14, fee:280, duration:30 },
  { id:"d19", nameAr:"د. بدر السبيعي",     nameEn:"Dr. Badr Al Subaie",     dept:"endocrine",     titleAr:"استشاري غدد صماء وسكري",     titleEn:"Endocrinology Consultant",         exp:16, fee:260, duration:30 },
  { id:"d20", nameAr:"د. منيرة العبدالله", nameEn:"Dr. Muneera Al Abdullah",dept:"psychiatry",    titleAr:"استشارية طب نفسي",           titleEn:"Psychiatry Consultant",            exp:12, fee:300, duration:45 },
  { id:"d21", nameAr:"د. فهد الزيودي",     nameEn:"Dr. Fahad Al Zeyoudi",   dept:"physio",        titleAr:"أخصائي علاج طبيعي",          titleEn:"Physiotherapy Specialist",         exp:8,  fee:150, duration:45 },
  { id:"d22", nameAr:"د. سعاد المهيري",    nameEn:"Dr. Suaad Al Mehairi",   dept:"oncology",      titleAr:"استشارية أورام",             titleEn:"Oncology Consultant",              exp:18, fee:350, duration:45 },
  { id:"d23", nameAr:"د. عبدالله الكتبي",  nameEn:"Dr. Abdullah Al Ketbi",  dept:"general",       titleAr:"أخصائي طب عام",              titleEn:"General Medicine Specialist",      exp:10, fee:150, duration:20 },
  { id:"d24", nameAr:"د. مروة المزروعي",   nameEn:"Dr. Marwa Al Mazrouei",  dept:"surgery",       titleAr:"استشارية جراحة عامة",        titleEn:"General Surgery Consultant",       exp:15, fee:300, duration:30 },
];

const TIME_SLOTS = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","13:00","13:30","14:00","16:00","16:30","17:00","17:30","18:00"];

const HOSPITAL_INFO = {
  nameAr: "مستشفى الموسي التخصصي",
  nameEn: "Al Mousa Specialty Hospital",
  addressAr: "شارع الشيخ زايد، دبي، الإمارات العربية المتحدة",
  addressEn: "Sheikh Zayed Road, Dubai, United Arab Emirates",
  phone: "04-123-4567",
  emergency: "800-MOUSA",
  email: "info@almousahospital.ae",
  hoursAr: "العيادات الخارجية: 8 صباحاً - 10 مساءً | الطوارئ: 24/7",
  hoursEn: "Outpatient clinics: 8 AM - 10 PM | Emergency: 24/7",
  mapsLink: "https://www.google.com/maps?q=Sheikh+Zayed+Road,Dubai",
  website: "https://example.com/almousa-hospital", // عدّل هذا برابط الموقع الفعلي بعد النشر
};

// ---------- دوال مساعدة لاستخراج الاسم/العنوان حسب اللغة ----------
function deptName(dept, lang) {
  return lang === "en" ? dept.nameEn : dept.nameAr;
}
function doctorName(doc, lang) {
  return lang === "en" ? doc.nameEn : doc.nameAr;
}
function doctorTitle(doc, lang) {
  return lang === "en" ? doc.titleEn : doc.titleAr;
}
function hospitalName(lang) {
  return lang === "en" ? HOSPITAL_INFO.nameEn : HOSPITAL_INFO.nameAr;
}
function hospitalAddress(lang) {
  return lang === "en" ? HOSPITAL_INFO.addressEn : HOSPITAL_INFO.addressAr;
}
function hospitalHours(lang) {
  return lang === "en" ? HOSPITAL_INFO.hoursEn : HOSPITAL_INFO.hoursAr;
}

module.exports = {
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
};
