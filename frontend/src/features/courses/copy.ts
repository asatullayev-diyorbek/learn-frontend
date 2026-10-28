/*
 * User-facing strings for the course catalog and course pages.
 * Typography: o‘ / g‘ use U+2018, the tutuq belgisi (ta’lim) uses U+2019.
 */
import type { CourseLevel } from "../../types/api";
import type { RequestErrorKind } from "../auth/errors";

export const LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: "Boshlang‘ich",
  intermediate: "O‘rta",
  advanced: "Yuqori",
};

export const COURSE_LEVELS: readonly CourseLevel[] = ["beginner", "intermediate", "advanced"];

export const COURSES_COPY = {
  pageTitle: "Kurslar — Learn",
  title: "Kurslar",
  lead: "O‘zingizga mos kursni tanlang: yo‘nalish va daraja bo‘yicha saralang yoki nomidan qidiring.",

  filters: {
    label: "Kurslarni saralash",
    category: "Yo‘nalish",
    level: "Daraja",
    all: "Barchasi",
    search: "Kurslarni qidirish",
    searchPlaceholder: "Kurs nomi yoki mavzusi…",
    categoriesFailed: "Yo‘nalishlarni yuklab bo‘lmadi.",
  },

  count: (n: number) => `${n} ta kurs`,
  found: (n: number) => `${n} ta kurs topildi`,
  updating: "Yangilanmoqda…",
  loading: "Kurslar yuklanmoqda…",

  loadMore: "Yana yuklash",
  loadingMore: "Yuklanmoqda…",
  loadedMore: (n: number) => `Yana ${n} ta kurs yuklandi`,
  loadMoreFailed: "Keyingi kurslarni yuklab bo‘lmadi. Qayta urinib ko‘ring.",

  emptyTitle: "Hech narsa topilmadi",
  emptyDescription: "Bu shartlarga mos kurs yo‘q. Filtrlarni o‘zgartiring yoki tozalang.",
  emptyCatalogTitle: "Hozircha kurslar yo‘q",
  emptyCatalogDescription: "Birinchi kurslar tez orada shu yerda paydo bo‘ladi.",
  clearFilters: "Filtrlarni tozalash",

  enrolledBadge: "Yozilgansiz",
  students: (n: number) => `${n} ta o‘quvchi`,
  instructor: "Muallif",

  retry: "Qayta urinish",
} as const;

export const COURSE_DETAIL_COPY = {
  pageTitle: (title: string) => `${title} — Learn`,
  loadingTitle: "Kurs — Learn",
  loading: "Kurs yuklanmoqda…",
  back: "Barcha kurslar",
  about: "Kurs haqida",
  instructor: "Muallif",

  notFoundTitle: "Kurs topilmadi",
  notFoundDescription: "Bu kurs olib tashlangan yoki havola noto‘g‘ri bo‘lishi mumkin.",
  notFoundAction: "Barcha kurslar",

  enroll: {
    heading: "Kursga yozilish",
    enroll: "Kursga yozilish",
    enrolling: "Yozilmoqda…",
    enrolled: "Yozilgansiz",
    enrolledNote: "Kurs sizning ro‘yxatingizda.",
    unenroll: "Kursdan chiqish",
    unenrolling: "Chiqilmoqda…",
    guestCta: "Kirish va kursga yozilish",
    guestNote: "Kursga yozilish uchun Telegram orqali tizimga kiring.",
    checking: "Hisob tekshirilmoqda…",
    announceEnrolled: "Kursga yozildingiz.",
    announceUnenrolled: "Kursdan chiqdingiz.",
  },

  retry: "Qayta urinish",
} as const;

/** Load failures for the list and the detail page (same wording as home/login). */
export const COURSES_ERROR_COPY: Record<RequestErrorKind, { title: string; description: string }> = {
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
    description: "Ma’lumotlarni yuklab bo‘lmadi. Birozdan so‘ng qayta urinib ko‘ring.",
  },
};

/** Inline enroll/unenroll failures. The button stays in its pre-click state. */
export type EnrollErrorKind = RequestErrorKind | "not_authenticated";

export const ENROLL_ERROR_COPY: Record<EnrollErrorKind, string> = {
  network: "Serverga ulanib bo‘lmadi. Internet aloqangizni tekshiring va qayta urinib ko‘ring.",
  rate_limited: "Juda ko‘p urinish. Bir daqiqadan so‘ng qayta urinib ko‘ring.",
  server: "Amalni bajarib bo‘lmadi. Birozdan so‘ng qayta urinib ko‘ring.",
  not_authenticated: "Sessiyangiz tugagan. Davom etish uchun qaytadan kiring.",
};
