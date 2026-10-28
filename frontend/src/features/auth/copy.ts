/*
 * All user-facing strings for the auth feature, in one place.
 * Typography: o‘ / g‘ use U+2018, the tutuq belgisi (Telegram’da) uses U+2019.
 */
import type { CodeErrorKind, RequestErrorKind } from "./errors";

export const AUTH_COPY = {
  pageTitle: "Kirish — Learn",
  title: "Tizimga kirish",
  subtitle: "Telegram hisobingiz orqali kiring — parol talab qilinmaydi.",
  tabsLabel: "Kirish usuli",
  tabToken: "Havola orqali",
  tabCode: "Kod orqali",

  token: {
    loading: "Kirish havolasi tayyorlanmoqda…",
    lead: "Botni oching va Start tugmasini bosing. Tasdiqlaganingizdan so‘ng bu sahifa o‘zi yangilanadi.",
    openBot: "Telegram botga o‘tish",
    waiting: "Tasdiqlash kutilmoqda",
    reconnecting: "Aloqa uzildi, qayta ulanmoqda…",
    timeLeft: "Havola amal qilish muddati:",
    fallbackDivider: "Havola ochilmadimi?",
    tokenLabel: "Kirish tokeni",
    tokenHint: "Botga /start va shu tokenni yuboring.",
    expiredTitle: "Muddati tugadi",
    expiredDescription:
      "Xavfsizlik uchun havola cheklangan vaqt amal qiladi. Davom etish uchun yangisini oling.",
    expiredAction: "Yangi havola olish",
    retry: "Qayta urinish",
  },

  code: {
    openBot: "Telegram botni ochish",
    inputLabel: "Tasdiqlash kodi",
    submit: "Tasdiqlash va kirish",
    submitting: "Tekshirilmoqda…",
    expiry: "Kod 5 daqiqa amal qiladi.",
  },

  success: {
    title: "Muvaffaqiyatli kirdingiz",
    description: "Bosh sahifaga yo‘naltirilmoqda…",
  },

  copy: {
    copy: "Nusxalash",
    copied: "Nusxalandi!",
  },
} as const;

export const TOKEN_ERROR_COPY: Record<RequestErrorKind, { title: string; description: string }> = {
  network: {
    title: "Serverga ulanib bo‘lmadi",
    description: "Internet aloqangizni tekshiring va qayta urinib ko‘ring.",
  },
  rate_limited: {
    title: "Juda ko‘p urinish",
    description: "Bir daqiqadan so‘ng qayta urinib ko‘ring.",
  },
  server: {
    title: "Nimadir noto‘g‘ri ketdi",
    description: "Kirish havolasini tayyorlab bo‘lmadi. Birozdan so‘ng qayta urinib ko‘ring.",
  },
};

export const CODE_ERROR_COPY: Record<CodeErrorKind, string> = {
  incomplete: "Kod 5 ta raqamdan iborat bo‘lishi kerak.",
  invalid: "Kod noto‘g‘ri. Telegram’dagi kodni tekshirib, qayta kiriting.",
  expired: "Kodning muddati tugagan. Botga /login yuborib, yangi kod oling.",
  used: "Bu kod allaqachon ishlatilgan. Yangi kod uchun botga /login yuboring.",
  network: "Serverga ulanib bo‘lmadi. Internet aloqangizni tekshiring.",
  rate_limited: "Juda ko‘p urinish. Bir daqiqadan so‘ng qayta urinib ko‘ring.",
  server: "Kodni tekshirib bo‘lmadi. Birozdan so‘ng qayta urinib ko‘ring.",
};
