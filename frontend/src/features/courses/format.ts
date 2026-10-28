/** Up to two initials from a name or title: "Python asoslari" → "PA". */
export function initials(text: string, fallback = "L"): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const letters = words.slice(0, 2).map((word) => Array.from(word)[0] ?? "");
  return letters.join("").toLocaleUpperCase("uz") || fallback;
}
