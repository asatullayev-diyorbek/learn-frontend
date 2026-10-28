/**
 * "https://t.me/<bot>?start=<token>" → "https://t.me/<bot>".
 * The bot username is never hard-coded: it always comes from the backend's
 * deep_link.
 */
export function deriveBotUrl(deepLink: string): string {
  try {
    const url = new URL(deepLink);
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    const cut = deepLink.search(/[?#]/);
    return cut === -1 ? deepLink : deepLink.slice(0, cut);
  }
}
