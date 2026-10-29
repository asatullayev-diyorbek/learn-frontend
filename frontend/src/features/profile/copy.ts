/*
 * User-facing strings for the profile page.
 * Typography: o‘ / g‘ use U+2018, the tutuq belgisi (ta’lim) uses U+2019.
 *
 * The "no courses yet" invitation deliberately reuses the member home's
 * wording (HOME_COPY.member) — same situation, same words.
 */
import { HOME_COPY } from "../home/copy";

export const PROFILE_COPY = {
  pageTitle: "Profil — Learn",
  eyebrow: "Profil",
  loading: "Profil yuklanmoqda…",

  myCourses: {
    title: "Mening kurslarim",
    emptyTitle: "Hali hech qaysi kursga yozilmagansiz",
    emptyDescription: HOME_COPY.member.browseDescription,
    emptyAction: HOME_COPY.member.browseAction,
  },
} as const;
