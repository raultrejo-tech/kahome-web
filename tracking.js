/* Meta Pixel is loaded only after an explicit marketing consent. */
(() => {
  "use strict";
  const PIXEL_ID = "1837394670614069"; // Kahome Web (portfolio Kahome mx, KahomeMX Ads), creado el 22 nov 2026.
  const CONSENT_KEY = "kahome.marketing-consent.v1";
  const MAX_AGE = 180 * 24 * 60 * 60 * 1000;
  const banner = document.getElementById("marketingConsent");
  const settings = document.getElementById("marketingSettings");
  let consent = false;
  let initialized = false;
  let pageViewed = false;
  let returnFocus = null;

  function readConsent() {
    try {
      const saved = JSON.parse(localStorage.getItem(CONSENT_KEY));
      if (saved && typeof saved.accepted === "boolean" &&
          Number.isFinite(saved.savedAt) && saved.savedAt <= Date.now() &&
          Date.now() - saved.savedAt < MAX_AGE) return saved.accepted;
    } catch (_) { /* Storage may be unavailable or contain an old value. */ }
    return null;
  }

  function syncBannerHeight() {
    const h = banner.hidden ? 0 : banner.offsetHeight;
    if (document.body.style) document.body.style.setProperty("--consent-h", `${h}px`);
  }

  function showBanner(show) {
    banner.hidden = !show;
    document.body.classList.toggle("marketing-consent-open", show);
    syncBannerHeight();
  }

  if (typeof ResizeObserver === "function") new ResizeObserver(syncBannerHeight).observe(banner);
  window.addEventListener("resize", syncBannerHeight);

  function loadPixel() {
    if (!consent || !/^\d{10,20}$/.test(PIXEL_ID)) return;
    if (!initialized) {
      // Standard Meta queue, without automatic matching or form-field data.
      const fbq = window.fbq = function () {
        fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
      };
      if (!window._fbq) window._fbq = fbq;
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = "2.0";
      fbq.queue = [];
      fbq("consent", "grant");
      fbq("set", "autoConfig", false, PIXEL_ID);
      fbq("init", PIXEL_ID);
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(script);
      initialized = true;
    } else {
      window.fbq("consent", "grant");
    }
    if (!pageViewed) {
      window.fbq("trackSingle", PIXEL_ID, "PageView");
      pageViewed = true;
    }
  }

  function clearPixelCookies() {
    const hostParts = location.hostname.split(".");
    for (const name of ["_fbp", "_fbc"]) {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      for (let i = 0; i < hostParts.length - 1; i++) {
        const domain = hostParts.slice(i).join(".");
        document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}; SameSite=Lax`;
        document.cookie = `${name}=; Max-Age=0; path=/; domain=.${domain}; SameSite=Lax`;
      }
    }
  }

  function applyConsent(accepted) {
    consent = accepted;
    if (accepted) loadPixel();
    else {
      if (initialized) window.fbq("consent", "revoke");
      clearPixelCookies();
    }
  }

  function saveConsent(accepted) {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted, savedAt: Date.now() }));
    } catch (_) { /* Honor the choice for this page even without persistence. */ }
    applyConsent(accepted);
    showBanner(false);
    if (returnFocus) returnFocus.focus();
    else settings.focus({ preventScroll: true });
  }

  function trackWhatsApp(source) {
    if (!consent || !initialized) return;
    // This is an outbound click, not proof of a sent message, lead or sale.
    window.fbq("trackSingleCustom", PIXEL_ID, "WhatsAppClick", { source });
  }

  document.getElementById("marketingAccept").addEventListener("click", () => saveConsent(true));
  document.getElementById("marketingReject").addEventListener("click", () => saveConsent(false));
  settings.addEventListener("click", () => {
    returnFocus = settings;
    showBanner(true);
    document.getElementById("marketingReject").focus({ preventScroll: true });
  });
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-wa-link]");
    if (!link) return;
    trackWhatsApp(link.classList.contains("wa-float") ? "floating_button" : "website_link");
  });
  // The form emits this only after its existing validation succeeds.
  document.addEventListener("kahome:whatsapp-form", () => trackWhatsApp("quote_form"));
  window.addEventListener("storage", (event) => {
    if (event.key !== CONSENT_KEY && event.key !== null) return;
    const choice = readConsent();
    applyConsent(choice === true);
    showBanner(choice === null);
  });

  const savedChoice = readConsent();
  applyConsent(savedChoice === true);
  showBanner(savedChoice === null);
})();
