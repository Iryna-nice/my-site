(function () {
  // Replace with your deployed Cloudflare Worker URL, e.g. "https://eberhardt-chat.YOUR-SUBDOMAIN.workers.dev"
  const WORKER_URL = "https://eberhardt-chat.eberhardt.workers.dev";

  const STRINGS = {
    en: { title: "Eberhardt AI Assistant", placeholder: "Ask about our services...", send: "Send",
          greeting: "Hi! I can answer questions about Eberhardt AI's automation and website services. What would you like to know?",
          error: "Something went wrong. Please email hello@eberhardt.ai or try again." },
    de: { title: "Eberhardt AI Assistent", placeholder: "Fragen Sie uns etwas...", send: "Senden",
          greeting: "Hallo! Ich beantworte Fragen zu den Automatisierungs- und Website-Services von Eberhardt AI. Was möchten Sie wissen?",
          error: "Etwas ist schiefgelaufen. Bitte schreiben Sie an hello@eberhardt.ai oder versuchen Sie es erneut." },
    fr: { title: "Assistant Eberhardt AI", placeholder: "Posez votre question...", send: "Envoyer",
          greeting: "Bonjour ! Je peux répondre à vos questions sur les services d'automatisation et de sites web d'Eberhardt AI. Que souhaitez-vous savoir ?",
          error: "Une erreur s'est produite. Écrivez à hello@eberhardt.ai ou réessayez." },
    it: { title: "Assistente Eberhardt AI", placeholder: "Fai una domanda...", send: "Invia",
          greeting: "Ciao! Posso rispondere a domande sui servizi di automazione e sviluppo siti di Eberhardt AI. Cosa vorresti sapere?",
          error: "Qualcosa è andato storto. Scrivi a hello@eberhardt.ai o riprova." },
    ru: { title: "Ассистент Eberhardt AI", placeholder: "Задайте вопрос...", send: "Отправить",
          greeting: "Привет! Я отвечу на вопросы об автоматизации и разработке сайтов Eberhardt AI. Что вас интересует?",
          error: "Что-то пошло не так. Напишите на hello@eberhardt.ai или попробуйте снова." },
    uk: { title: "Асистент Eberhardt AI", placeholder: "Поставте запитання...", send: "Надіслати",
          greeting: "Привіт! Я відповім на запитання про автоматизацію та розробку сайтів Eberhardt AI. Що вас цікавить?",
          error: "Щось пішло не так. Напишіть на hello@eberhardt.ai або спробуйте ще раз." },
  };

  function currentLang() {
    const saved = localStorage.getItem("eberhardt-lang");
    return STRINGS[saved] ? saved : "en";
  }

  const history = [];
  let lang = currentLang();
  let s = STRINGS[lang];

  const toggleBtn = document.createElement("button");
  toggleBtn.className = "chat-toggle";
  toggleBtn.setAttribute("aria-label", "Chat");
  toggleBtn.textContent = "💬";

  const panel = document.createElement("div");
  panel.className = "chat-panel";
  panel.innerHTML = `
    <div class="chat-header">
      <span><span class="dot"></span><span class="chat-title"></span></span>
      <button class="chat-close" aria-label="Close">✕</button>
    </div>
    <div class="chat-messages"></div>
    <div class="chat-input-row">
      <input type="text" class="chat-input" autocomplete="off" />
      <button class="chat-send"></button>
    </div>
  `;

  document.body.appendChild(toggleBtn);
  document.body.appendChild(panel);

  const messagesEl = panel.querySelector(".chat-messages");
  const inputEl = panel.querySelector(".chat-input");
  const sendBtn = panel.querySelector(".chat-send");
  const titleEl = panel.querySelector(".chat-title");

  function applyStrings() {
    lang = currentLang();
    s = STRINGS[lang];
    titleEl.textContent = s.title;
    inputEl.placeholder = s.placeholder;
    sendBtn.textContent = s.send;
  }

  function addMessage(role, text) {
    const div = document.createElement("div");
    div.className = "chat-msg " + role;
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  let opened = false;
  toggleBtn.addEventListener("click", () => {
    panel.classList.toggle("open");
    if (!opened) {
      opened = true;
      applyStrings();
      addMessage("assistant", s.greeting);
    }
  });
  panel.querySelector(".chat-close").addEventListener("click", () => panel.classList.remove("open"));

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = "";
    addMessage("user", text);
    history.push({ role: "user", content: text });

    sendBtn.disabled = true;
    const typingEl = addMessage("assistant typing", "…");

    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: history.slice(0, -1) }),
      });
      const data = await res.json();
      typingEl.remove();
      if (!res.ok || data.error) throw new Error(data.error || "request failed");
      addMessage("assistant", data.reply);
      history.push({ role: "assistant", content: data.reply });
    } catch (err) {
      typingEl.remove();
      addMessage("assistant", s.error);
    } finally {
      sendBtn.disabled = false;
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  document.getElementById("lang-switcher").addEventListener("change", () => {
    if (opened) applyStrings();
  });
})();
