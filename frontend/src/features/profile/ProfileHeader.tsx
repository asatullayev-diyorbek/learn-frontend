import { TelegramIcon } from "../../components/icons";
import type { CurrentUser } from "../../types/api";
import { getDisplayName } from "../auth/useCurrentUser";
import { initials } from "../courses/format";
import { PROFILE_COPY } from "./copy";
import styles from "./Profile.module.css";

/**
 * Who is signed in: initials, the same display name as the header greeting,
 * and the Telegram username. /me has no join date, so none is shown.
 */
export function ProfileHeader({ user }: { user: CurrentUser }) {
  const displayName = getDisplayName(user);
  const telegramUsername = user.telegram_username.trim().replace(/^@/, "");
  const handle = telegramUsername ? `@${telegramUsername}` : null;
  const fullName = [user.first_name, user.last_name].map((part) => part.trim()).join(" ").trim();

  return (
    <header className={styles.intro} data-testid="profile-header">
      <span className={styles.avatar} aria-hidden="true">
        {initials(fullName || telegramUsername || displayName)}
      </span>
      <div className={styles.identity}>
        <p className={styles.eyebrow}>{PROFILE_COPY.eyebrow}</p>
        <h1 className={styles.name}>{displayName}</h1>
        {/* Skip the handle when it already is the display name (no first name). */}
        {handle && handle !== displayName && (
          <p className={styles.meta} data-testid="profile-telegram">
            <TelegramIcon size={16} className={styles.metaIcon} />
            <span className={styles.metaText}>{handle}</span>
          </p>
        )}
      </div>
    </header>
  );
}
