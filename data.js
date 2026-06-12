// ===================== بيانات مستشفى الموسي التخصصي - إيجنت الواتساب =====================
// نفس بيانات data.js المستخدمة في الموقع (الأقسام والأطباء)

const DEPARTMENTS = [
  { id: "cardio",      name: "أمراض القلب والشرايين", icon: "❤️" },
  { id: "ortho",       name: "جراحة العظام والمفاصل", icon: "🦴" },
  { id: "pediatrics",  name: "طب الأطفال", icon: "🧒" },
  { id: "obgyn",       name: "النساء والولادة", icon: "🤰" },
  { id: "derma",       name: "الجلدية والتجميل", icon: "🌿" },
  { id: "dental",      name: "طب وجراحة الأسنان", icon: "🦷" },
  { id: "neuro",       name: "الأعصاب والمخ", icon: "🧠" },
  { id: "ent",         name: "الأنف والأذن والحنجرة", icon: "👂" },
  { id: "ophthalmology", name: "طب وجراحة العيون", icon: "👁️" },
  { id: "urology",     name: "المسالك البولية", icon: "🩺" },
  { id: "gastro",      name: "الجهاز الهضمي والكبد", icon: "🍃" },
  { id: "endocrine",   name: "الغدد الصماء والسكري", icon: "⚗️" },
  { id: "psychiatry",  name: "الطب النفسي", icon: "🧩" },
  { id: "physio",      name: "العلاج الطبيعي والتأهيل", icon: "🏃" },
  { id: "oncology",    name: "الأورام", icon: "🎗️" },
  { id: "nutrition",   name: "التغذية العلاجية", icon: "🥗" },
  { id: "general",     name: "الطب العام", icon: "🩹" },
  { id: "lab",         name: "المختبر الطبي", icon: "🧪" },
  { id: "radiology",   name: "الأشعة والتصوير الطبي", icon: "📷" },
  { id: "emergency",   name: "الطوارئ", icon: "🚑" },
  { id: "surgery",     name: "الجراحة العامة", icon: "🔬" },
  { id: "dialysis",    name: "أمراض الكلى والغسيل الكلوي", icon: "💧" },
];

const DOCTORS = [
  { id:"d1",  name:"د. أحمد المنصوري",   dept:"cardio",     title:"استشاري أمراض القلب",      exp:20, fee:300, duration:30 },
  { id:"d2",  name:"د. سارة الزعابي",    dept:"cardio",     title:"أخصائية قلب وأوعية دموية", exp:12, fee:250, duration:30 },
  { id:"d3",  name:"د. خالد العامري",    dept:"ortho",      title:"استشاري جراحة العظام",     exp:18, fee:280, duration:30 },
  { id:"d4",  name:"د. منى الكندي",      dept:"ortho",      title:"أخصائية جراحة العظام",     exp:9,  fee:220, duration:30 },
  { id:"d5",  name:"د. فاطمة الهاشمي",   dept:"pediatrics", title:"استشارية طب أطفال",        exp:15, fee:200, duration:20 },
  { id:"d6",  name:"د. يوسف النعيمي",    dept:"pediatrics", title:"أخصائي طب أطفال",          exp:8,  fee:180, duration:20 },
  { id:"d7",  name:"د. ليلى المطيري",    dept:"obgyn",      title:"استشارية نساء وولادة",     exp:17, fee:300, duration:30 },
  { id:"d8",  name:"د. هند الشامسي",     dept:"obgyn",      title:"أخصائية نساء وولادة",      exp:10, fee:230, duration:30 },
  { id:"d9",  name:"د. عمر الفلاسي",     dept:"derma",      title:"استشاري جلدية وتجميل",     exp:14, fee:250, duration:20 },
  { id:"d10", name:"د. ريم البلوشي",     dept:"derma",      title:"أخصائية جلدية",           exp:7,  fee:200, duration:20 },
  { id:"d11", name:"د. ماجد الظاهري",    dept:"dental",     title:"استشاري طب أسنان وزراعة",  exp:16, fee:200, duration:30 },
  { id:"d12", name:"د. نورة السويدي",    dept:"dental",     title:"أخصائية تقويم أسنان",     exp:9,  fee:180, duration:30 },
  { id:"d13", name:"د. سلطان الكعبي",    dept:"neuro",      title:"استشاري أمراض الأعصاب",   exp:19, fee:320, duration:30 },
  { id:"d14", name:"د. عائشة الرميثي",   dept:"neuro",      title:"أخصائية أعصاب",           exp:11, fee:260, duration:30 },
  { id:"d15", name:"د. طارق اليافعي",    dept:"ent",        title:"استشاري أنف وأذن وحنجرة", exp:13, fee:240, duration:20 },
  { id:"d16", name:"د. هيا الدرمكي",     dept:"ophthalmology", title:"استشارية طب وجراحة عيون", exp:15, fee:270, duration:30 },
  { id:"d17", name:"د. راشد القاسمي",    dept:"urology",    title:"استشاري مسالك بولية",     exp:17, fee:290, duration:30 },
  { id:"d18", name:"د. نوف الشحي",       dept:"gastro",      title:"استشارية جهاز هضمي وكبد", exp:14, fee:280, duration:30 },
  { id:"d19", name:"د. بدر السبيعي",     dept:"endocrine",  title:"استشاري غدد صماء وسكري",  exp:16, fee:260, duration:30 },
  { id:"d20", name:"د. منيرة العبدالله", dept:"psychiatry", title:"استشارية طب نفسي",        exp:12, fee:300, duration:45 },
  { id:"d21", name:"د. فهد الزيودي",     dept:"physio",     title:"أخصائي علاج طبيعي",       exp:8,  fee:150, duration:45 },
  { id:"d22", name:"د. سعاد المهيري",    dept:"oncology",   title:"استشارية أورام",          exp:18, fee:350, duration:45 },
  { id:"d23", name:"د. عبدالله الكتبي",  dept:"general",    title:"أخصائي طب عام",           exp:10, fee:150, duration:20 },
  { id:"d24", name:"د. مروة المزروعي",   dept:"surgery",    title:"استشارية جراحة عامة",     exp:15, fee:300, duration:30 },
];

const TIME_SLOTS = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","13:00","13:30","14:00","16:00","16:30","17:00","17:30","18:00"];

const HOSPITAL_INFO = {
  name: "مستشفى الموسي التخصصي",
  address: "شارع الشيخ زايد، دبي، الإمارات العربية المتحدة",
  phone: "04-123-4567",
  emergency: "800-MOUSA",
  email: "info@almousahospital.ae",
  hours: "العيادات الخارجية: 8 صباحاً - 10 مساءً | الطوارئ: 24/7",
  mapsLink: "https://www.google.com/maps?q=Sheikh+Zayed+Road,Dubai",
  website: "https://example.com/almousa-hospital", // عدّل هذا برابط الموقع الفعلي بعد النشر
};

module.exports = { DEPARTMENTS, DOCTORS, TIME_SLOTS, HOSPITAL_INFO };
