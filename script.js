const SUPPORTED_LANGS = ['en', 'de', 'fr', 'it', 'ru', 'uk'];
const DEFAULT_LANG = 'en';

function applyLanguage(lang) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANG];

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) el.textContent = dict[key];
  });

  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    if (dict[key] !== undefined) el.innerHTML = dict[key];
  });

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription && dict['meta.description']) {
    metaDescription.setAttribute('content', dict['meta.description']);
  }

  document.getElementById('html-root').setAttribute('lang', lang);
  localStorage.setItem('eberhardt-lang', lang);
}

function initLanguage() {
  const saved = localStorage.getItem('eberhardt-lang');
  const lang = SUPPORTED_LANGS.includes(saved) ? saved : DEFAULT_LANG;
  document.getElementById('lang-switcher').value = lang;
  applyLanguage(lang);
}

document.getElementById('lang-switcher').addEventListener('change', (e) => {
  applyLanguage(e.target.value);
});

document.getElementById('contact-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const lang = document.getElementById('lang-switcher').value;
  const note = document.getElementById('form-note');
  note.textContent = TRANSLATIONS[lang]['contact.formNote'];
  e.target.reset();
});

initLanguage();
