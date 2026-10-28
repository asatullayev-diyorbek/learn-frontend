/*
 * User-facing strings for the home page.
 * Typography: o‘ / g‘ use U+2018, the tutuq belgisi (ta’lim) uses U+2019.
 */
import type { RequestErrorKind } from "../auth/errors";

export const HOME_COPY = {
  pageTitle: "Learn — onlayn ta’lim platformasi",

  guest: {
    eyebrow: "Onlayn ta’lim platformasi",
    title: "Yangi bilimlarni o‘z sur’atingizda o‘rganing",
    lead: "Learn kurslar, darslar va amaliy topshiriqlarni bir joyga jamlaydi — o‘qishni boshlang va to‘xtagan joyingizdan davom eting.",
    cta: "Telegram orqali kirish",
    ctaNote: "Parol kerak emas — Telegram hisobingiz yetarli.",
    featuresTitle: "Learn nimaga yordam beradi",
  },

  features: [
    {
      id: "structured",
      title: "Tartibli kurslar",
      description:
        "Har bir kurs mavzu va darslarga bo‘lingan: qayerdan boshlash va keyin nimani o‘rganishni bilasiz.",
    },
    {
      id: "pace",
      title: "O‘z sur’atingizda",
      description:
        "Darslarni istalgan vaqtda, istalgan qurilmada o‘ting — telefon ham, kompyuter ham.",
    },
    {
      id: "practice",
      title: "Amaliyot bilan",
      description: "O‘rganganingizni amaliy topshiriqlarda darhol qo‘llab, mustahkamlaysiz.",
    },
    {
      id: "telegram",
      title: "Oson kirish",
      description: "Ro‘yxatdan o‘tish shart emas: Telegram orqali bir necha soniyada kirasiz.",
    },
  ],

  member: {
    welcome: (name: string) => `Xush kelibsiz, ${name}!`,
    lead: "Bu sizning Learn’dagi sahifangiz. O‘qishni shu yerdan boshlaysiz.",
    browseTitle: "O‘qishni boshlang",
    browseDescription:
      "Kurslar katalogini ko‘rib chiqing: yo‘nalish va darajangizga mos kursni tanlab, unga yoziling.",
    browseAction: "Kurslarni ko‘rish",
  },

  loading: "Sahifa yuklanmoqda…",

  retry: "Qayta urinish",
} as const;

export const HOME_ERROR_COPY: Record<RequestErrorKind, { title: string; description: string }> = {
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
    description: "Sahifani yuklab bo‘lmadi. Birozdan so‘ng qayta urinib ko‘ring.",
  },
};

export type HomeFeatureId = (typeof HOME_COPY.features)[number]["id"];
