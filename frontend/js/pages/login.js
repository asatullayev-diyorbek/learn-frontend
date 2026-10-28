// Learn — login page wiring: tab switching, token flow + polling,
// 5-digit code flow, and all the inline error/status rendering.

import { ApiError, NetworkError } from "../api/client.js";
import {
  fetchCsrfCookie,
  requestTelegramToken,
  pollTelegramTokenStatus,
  verifyTelegramCode,
} from "../api/auth.js";

const POLL_INTERVAL_MS = 2000;
const REDIRECT_URL = "/index.html";

const els = {
  tabToken: document.getElementById("tab-token"),
  tabCode: document.getElementById("tab-code"),
  methodToken: document.getElementById("method-token"),
  methodCode: document.getElementById("method-code"),

  tokenStatus: document.getElementById("token-status"),
  tokenLoading: document.getElementById("token-loading"),
  tokenReady: document.getElementById("token-ready"),
  tokenError: document.getElementById("token-error"),
  tokenErrorText: document.getElementById("token-error-text"),
  tokenRetryBtn: document.getElementById("token-retry-btn"),
  deepLinkBtn: document.getElementById("deep-link-btn"),
  tokenValue: document.getElementById("token-value"),
  copyTokenBtn: document.getElementById("copy-token-btn"),
  copyFeedback: document.getElementById("copy-feedback"),
  tokenExpiryNote: document.getElementById("token-expiry-note"),
  switchToCodeBtn: document.getElementById("switch-to-code-btn"),

  botOpenBtn: document.getElementById("bot-open-btn"),
  codeForm: document.getElementById("code-form"),
  codeInput: document.getElementById("code-input"),
  codeSubmitBtn: document.getElementById("code-submit-btn"),
  codeError: document.getElementById("code-error"),
  switchToTokenBtn: document.getElementById("switch-to-token-btn"),
};

let pollTimer = null;
let currentToken = null;
let botUsernameLink = null; // plain https://t.me/<bot> derived from deep_link

function show(el) {
  if (el) el.hidden = false;
}
function hide(el) {
  if (el) el.hidden = true;
}

function friendlyErrorMessage(err) {
  if (err instanceof NetworkError) {
    return "Serverga ulanib bo'lmadi. Internet aloqasini tekshirib, qayta urining.";
  }
  if (err instanceof ApiError) {
    return err.body?.detail || "Xatolik yuz berdi. Birozdan so'ng qayta urining.";
  }
  return "Kutilmagan xatolik yuz berdi.";
}

function deriveBotLink(deepLink) {
  try {
    const url = new URL(deepLink);
    url.search = "";
    return url.toString();
  } catch {
    const qIndex = deepLink.indexOf("?");
    return qIndex === -1 ? deepLink : deepLink.slice(0, qIndex);
  }
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

function redirectToApp() {
  stopPolling();
  window.location.href = REDIRECT_URL;
}

/* ---------------- Method 1: deep link / token ---------------- */

async function startTokenFlow() {
  stopPolling();
  hide(els.tokenError);
  hide(els.tokenReady);
  show(els.tokenLoading);

  try {
    await fetchCsrfCookie();
    const data = await requestTelegramToken();
    currentToken = data.token;
    botUsernameLink = deriveBotLink(data.deep_link);

    els.deepLinkBtn.href = data.deep_link;
    els.tokenValue.textContent = data.token;
    if (els.botOpenBtn) {
      els.botOpenBtn.href = botUsernameLink;
    }

    const minutes = Math.max(1, Math.round((data.expires_in_seconds || 600) / 60));
    els.tokenExpiryNote.textContent = `Amal qilish muddati: ${minutes} daqiqa`;

    hide(els.tokenLoading);
    show(els.tokenReady);

    pollTimer = setInterval(() => pollOnce(currentToken), POLL_INTERVAL_MS);
  } catch (err) {
    hide(els.tokenLoading);
    els.tokenErrorText.textContent = friendlyErrorMessage(err);
    show(els.tokenError);
  }
}

async function pollOnce(token) {
  if (token !== currentToken) return; // stale timer guard
  try {
    const data = await pollTelegramTokenStatus(token);
    if (token !== currentToken) return;

    if (data.status === "confirmed") {
      redirectToApp();
    } else if (data.status === "expired") {
      stopPolling();
      hide(els.tokenReady);
      els.tokenErrorText.textContent = "Muddati tugadi. Yangi token so'rang.";
      show(els.tokenError);
    }
    // "pending" -> keep polling, no UI change.
  } catch {
    // Transient network hiccup during polling: stay quiet and try again
    // on the next tick rather than flashing an error every 2s.
  }
}

/* ---------------- Clipboard copy ---------------- */

async function copyToken() {
  if (!currentToken) return;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(currentToken);
    } else {
      const tmp = document.createElement("textarea");
      tmp.value = currentToken;
      tmp.style.position = "fixed";
      tmp.style.opacity = "0";
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand("copy");
      document.body.removeChild(tmp);
    }
    els.copyFeedback.hidden = false;
    clearTimeout(copyToken._t);
    copyToken._t = setTimeout(() => {
      els.copyFeedback.hidden = true;
    }, 1500);
  } catch {
    // Clipboard API can be denied by permissions; ignore silently, the
    // token text is still selectable/visible for manual copy.
  }
}

/* ---------------- Method 2: 5-digit code ---------------- */

function showCodeError(message) {
  els.codeError.textContent = message;
  els.codeError.hidden = false;
}

function hideCodeError() {
  els.codeError.hidden = true;
}

function codeErrorMessage(err) {
  if (err instanceof NetworkError) {
    return "Serverga ulanib bo'lmadi. Internet aloqasini tekshirib, qayta urining.";
  }
  if (err instanceof ApiError) {
    const status = err.body?.status;
    if (status === "invalid") return "Noto'g'ri kod. Qaytadan urining.";
    if (status === "expired") return "Muddati tugagan kod. Yangi kod oling.";
    if (status === "used") return "Bu kod allaqachon ishlatilgan.";
    return err.body?.detail || "Kodni tasdiqlashda xatolik yuz berdi.";
  }
  return "Kutilmagan xatolik yuz berdi.";
}

async function submitCode(event) {
  event.preventDefault();
  hideCodeError();

  const code = els.codeInput.value.trim();
  if (!/^\d{5}$/.test(code)) {
    showCodeError("Kod 5 ta raqamdan iborat bo'lishi kerak.");
    return;
  }

  els.codeSubmitBtn.disabled = true;
  try {
    await fetchCsrfCookie();
    await verifyTelegramCode(code);
    redirectToApp();
  } catch (err) {
    showCodeError(codeErrorMessage(err));
  } finally {
    els.codeSubmitBtn.disabled = false;
  }
}

/* ---------------- Tab switching ---------------- */

function activateTab(name) {
  const isToken = name === "token";
  els.tabToken.setAttribute("aria-selected", String(isToken));
  els.tabCode.setAttribute("aria-selected", String(!isToken));
  if (isToken) {
    show(els.methodToken);
    hide(els.methodCode);
  } else {
    hide(els.methodToken);
    show(els.methodCode);
  }
}

/* ---------------- Wiring ---------------- */

els.tabToken.addEventListener("click", () => activateTab("token"));
els.tabCode.addEventListener("click", () => activateTab("code"));
els.switchToCodeBtn.addEventListener("click", () => activateTab("code"));
els.switchToTokenBtn.addEventListener("click", () => activateTab("token"));

els.tokenRetryBtn.addEventListener("click", startTokenFlow);
els.copyTokenBtn.addEventListener("click", copyToken);

els.codeForm.addEventListener("submit", submitCode);
els.codeInput.addEventListener("input", () => {
  // Numeric-only UX: strip anything that isn't a digit as the user types.
  const digitsOnly = els.codeInput.value.replace(/\D/g, "").slice(0, 5);
  if (digitsOnly !== els.codeInput.value) {
    els.codeInput.value = digitsOnly;
  }
  hideCodeError();
});

startTokenFlow();
