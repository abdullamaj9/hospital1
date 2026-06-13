// ===================== ويدجت المساعد الذكي - مستشفى الموسي التخصصي =====================
// يتصل بسيرفر الإيجنت على Render عبر /api/chat
// يدعم: عربي/إنجليزي + ردود بأزرار اختيار + إدخال نصي عند الحاجة فقط

const AGENT_API_BASE = "https://hospital1-d85j.onrender.com"; // عدّل هذا الرابط إذا تغير رابط سيرفر Render

(function () {
  let currentLang = "ar";

  // ---------- توليد / استرجاع معرف الجلسة ----------
  function getSessionId() {
    let id = sessionStorage.getItem("almousa_chat_session");
    if (!id) {
      id = "web-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
      sessionStorage.setItem("almousa_chat_session", id);
    }
    return id;
  }

  // ---------- بناء عناصر الويدجت ----------
  function buildWidget() {
    const wrap = document.createElement("div");
    wrap.id = "agentChatWidget";
    wrap.innerHTML = `
      <button id="agentChatToggle" aria-label="فتح المساعد الذكي">
        <span class="agent-chat-icon-open">🩺</span>
        <span class="agent-chat-icon-close">✕</span>
        <span class="agent-chat-pulse"></span>
      </button>
      <div id="agentChatWindow" class="agent-chat-window" role="dialog" aria-label="المساعد الذكي لمستشفى الموسي">
        <div class="agent-chat-header">
          <div class="agent-chat-header-info">
            <span class="agent-chat-avatar">✚</span>
            <div>
              <strong id="agentChatTitle">المساعد الذكي</strong>
              <span class="agent-chat-status" id="agentChatStatus">متصل الآن</span>
            </div>
          </div>
          <div class="agent-chat-header-actions">
            <button id="agentChatLangToggle" class="agent-lang-toggle" type="button">EN</button>
            <button id="agentChatClose" aria-label="إغلاق المحادثة">✕</button>
          </div>
        </div>
        <div id="agentChatMessages" class="agent-chat-messages"></div>
        <div id="agentChatTyping" class="agent-chat-typing" style="display:none;">
          <span></span><span></span><span></span>
        </div>
        <div id="agentChatOptions" class="agent-chat-options"></div>
        <form id="agentChatForm" class="agent-chat-form">
          <input type="text" id="agentChatInput" placeholder="اكتب رسالتك هنا..." autocomplete="off" />
          <button type="submit" aria-label="إرسال">➤</button>
        </form>
      </div>
    `;
    document.body.appendChild(wrap);
  }

  // ---------- إضافة رسالة للواجهة ----------
  function appendMessage(text, sender) {
    const messages = document.getElementById("agentChatMessages");
    const bubble = document.createElement("div");
    bubble.className = `agent-msg agent-msg-${sender}`;
    bubble.innerHTML = formatMessage(text);
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  }

  function formatMessage(text) {
    const escaped = String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return escaped
      .replace(/\*(.+?)\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
  }

  function setTyping(show) {
    document.getElementById("agentChatTyping").style.display = show ? "flex" : "none";
    const messages = document.getElementById("agentChatMessages");
    messages.scrollTop = messages.scrollHeight;
  }

  // ---------- عرض أزرار الخيارات ----------
  function renderOptions(options, onSelect, inputType) {
    const wrap = document.getElementById("agentChatOptions");
    const form = document.getElementById("agentChatForm");
    const input = document.getElementById("agentChatInput");
    wrap.innerHTML = "";

    const hasOptions = options && options.length > 0;
    const isDateStep = inputType === "date";
    const isTextStep = inputType === "text";
    // إظهار حقل الإدخال إذا: الخطوة تطلب نصاً أو تاريخاً صريحاً، أو لا توجد أزرار أصلاً (احتياط)
    const showInput = isDateStep || isTextStep || !hasOptions;

    // أزرار الخيارات تظهر إن وُجدت
    if (hasOptions) {
      options.forEach((opt) => {
        const btn = document.createElement("button");
        btn.className = "agent-option-btn";
        btn.textContent = opt.label;
        btn.addEventListener("click", () => onSelect(opt.value, opt.label));
        wrap.appendChild(btn);
      });
      wrap.style.display = "flex";
    } else {
      wrap.style.display = "none";
    }

    if (showInput) {
      form.style.display = "flex";
      input.disabled = false;

      if (isDateStep) {
        input.type = "date";
        const today = new Date().toISOString().split("T")[0];
        input.min = today;
        input.placeholder = "";
      } else {
        input.type = "text";
        input.removeAttribute("min");
        input.placeholder = currentLang === "en" ? "Type your message..." : "اكتب رسالتك هنا...";
      }

      input.focus();
    } else {
      form.style.display = "none";
    }
  }


  // ---------- إرسال رسالة للسيرفر ----------
  async function sendToAgent(message) {
    const sessionId = getSessionId();
    try {
      const res = await fetch(`${AGENT_API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message }),
      });
      if (!res.ok) throw new Error("network");
      const data = await res.json();
      return { text: data.text || data.reply, options: data.options || [], inputType: data.inputType || "text" };
    } catch (err) {
      console.error("خطأ في الاتصال بالمساعد الذكي:", err);
      const errMsg =
        currentLang === "en"
          ? "⚠️ Couldn't connect to the smart assistant right now. Please try again later or contact us on WhatsApp at 0566350025."
          : "⚠️ تعذر الاتصال بالمساعد الذكي حالياً. يرجى المحاولة لاحقاً أو التواصل عبر واتساب على 0566350025.";
      return { text: errMsg, options: [], inputType: "text" };
    }
  }

  async function fetchWelcome(lang) {
    try {
      const res = await fetch(`${AGENT_API_BASE}/api/chat/welcome?lang=${lang}`);
      if (!res.ok) throw new Error("network");
      const data = await res.json();
      return { text: data.text || data.reply, options: data.options || [], inputType: data.inputType || "text" };
    } catch {
      const fallback =
        lang === "en"
          ? "🏥 *Welcome to Al Mousa Specialty Hospital* ✚\n\nHow can I help you?"
          : "🏥 *مرحباً بك في مستشفى الموسي التخصصي* ✚\n\nكيف يمكنني مساعدتك؟";
      return { text: fallback, options: [], inputType: "text" };
    }
  }

  function applyLangUI(lang) {
    currentLang = lang;
    const isAr = lang === "ar";
    document.documentElement.setAttribute("dir", document.documentElement.getAttribute("dir") || "rtl");

    const widget = document.getElementById("agentChatWidget");
    widget.classList.toggle("lang-en", !isAr);

    document.getElementById("agentChatTitle").textContent = isAr ? "المساعد الذكي" : "Smart Assistant";
    document.getElementById("agentChatStatus").textContent = isAr ? "متصل الآن" : "Online now";
    document.getElementById("agentChatInput").placeholder = isAr ? "اكتب رسالتك هنا..." : "Type your message...";
    document.getElementById("agentChatToggle").setAttribute("aria-label", isAr ? "فتح المساعد الذكي" : "Open smart assistant");
    document.getElementById("agentChatClose").setAttribute("aria-label", isAr ? "إغلاق المحادثة" : "Close chat");
    document.getElementById("agentChatLangToggle").textContent = isAr ? "EN" : "AR";
  }

  // ---------- تهيئة الويدجت ----------
  function init() {
    buildWidget();
    applyLangUI("ar");

    const toggleBtn = document.getElementById("agentChatToggle");
    const closeBtn = document.getElementById("agentChatClose");
    const langBtn = document.getElementById("agentChatLangToggle");
    const windowEl = document.getElementById("agentChatWindow");
    const form = document.getElementById("agentChatForm");
    const input = document.getElementById("agentChatInput");

    let opened = false;
    let started = false;

    async function startConversation(lang) {
      document.getElementById("agentChatMessages").innerHTML = "";
      setTyping(true);
      const welcome = await fetchWelcome(lang);
      setTyping(false);
      appendMessage(welcome.text, "bot");
      renderOptions(welcome.options, handleSelection, welcome.inputType);
    }

    async function openChat() {
      windowEl.classList.add("open");
      toggleBtn.classList.add("open");
      opened = true;
      if (!started) {
        started = true;
        await startConversation(currentLang);
      }
      if (form.style.display !== "none") input.focus();
    }

    function closeChat() {
      windowEl.classList.remove("open");
      toggleBtn.classList.remove("open");
      opened = false;
    }

    async function handleSelection(value, label) {
      appendMessage(label, "user");
      document.getElementById("agentChatOptions").innerHTML = "";
      document.getElementById("agentChatOptions").style.display = "none";
      setTyping(true);

      const response = await sendToAgent(value);

      setTyping(false);
      appendMessage(response.text, "bot");
      renderOptions(response.options, handleSelection, response.inputType);

      if (value === "close") {
        setTimeout(() => {
          if (opened) closeChat();
        }, 2200);
      }
    }

    toggleBtn.addEventListener("click", () => {
      if (opened) closeChat();
      else openChat();
    });
    closeBtn.addEventListener("click", closeChat);

    langBtn.addEventListener("click", async () => {
      const newLang = currentLang === "ar" ? "en" : "ar";
      applyLangUI(newLang);
      // إعادة تشغيل المحادثة بالقائمة الجديدة باللغة المختارة
      await sendToAgent(`lang:${newLang}`);
      await startConversation(newLang);
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      appendMessage(text, "user");
      input.value = "";
      input.disabled = true;
      setTyping(true);

      const response = await sendToAgent(text);

      setTyping(false);
      appendMessage(response.text, "bot");
      input.disabled = false;
      renderOptions(response.options, handleSelection, response.inputType);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
