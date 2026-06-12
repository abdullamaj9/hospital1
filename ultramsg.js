// ===================== وحدة UltraMsg API =====================
const axios = require("axios");

const INSTANCE_ID = process.env.ULTRAMSG_INSTANCE_ID || "instance179001";
const TOKEN = process.env.ULTRAMSG_TOKEN || "";
const BASE_URL = `https://api.ultramsg.com/${INSTANCE_ID}`;

if (!TOKEN) {
  console.warn("⚠️ تحذير: لم يتم ضبط متغير البيئة ULTRAMSG_TOKEN. الإرسال عبر واتساب لن يعمل.");
}

/**
 * إرسال رسالة نصية عبر واتساب
 * @param {string} to - رقم الهاتف (بصيغة دولية بدون +، مثل 9715XXXXXXXX)
 * @param {string} body - نص الرسالة
 */
async function sendMessage(to, body) {
  try {
    const params = new URLSearchParams();
    params.append("token", TOKEN);
    params.append("to", to);
    params.append("body", body);

    const res = await axios.post(`${BASE_URL}/messages/chat`, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return res.data;
  } catch (err) {
    console.error("❌ خطأ في إرسال رسالة UltraMsg:", err.response ? err.response.data : err.message);
    return null;
  }
}

/**
 * إرسال موقع جغرافي عبر واتساب
 */
async function sendLocation(to, lat, lng, address = "") {
  try {
    const params = new URLSearchParams();
    params.append("token", TOKEN);
    params.append("to", to);
    params.append("lat", lat);
    params.append("lng", lng);
    params.append("address", address);

    const res = await axios.post(`${BASE_URL}/messages/location`, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return res.data;
  } catch (err) {
    console.error("❌ خطأ في إرسال الموقع:", err.response ? err.response.data : err.message);
    return null;
  }
}

module.exports = { sendMessage, sendLocation, INSTANCE_ID, TOKEN };
