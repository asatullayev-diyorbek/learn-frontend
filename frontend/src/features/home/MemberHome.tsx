import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { BookIcon } from "../../components/icons";
import type { CurrentUser } from "../../types/api";
import { getDisplayName } from "../auth/useCurrentUser";
import { HOME_COPY } from "./copy";
import styles from "./Home.module.css";

const COPY = HOME_COPY.member;

/** Home for a signed-in user. No courses backend yet, so: an honest empty state. */
export function MemberHome({ user }: { user: CurrentUser }) {
  return (
    <div className={styles.member} data-testid="home-member">
      <div className={styles.memberIntro}>
        <h1 className={styles.pageTitle}>{COPY.welcome(getDisplayName(user))}</h1>
        <p className={styles.pageLead}>{COPY.lead}</p>
      </div>

      <Card className={styles.memberCard}>
        <EmptyState
          data-testid="courses-empty"
          tone="accent"
          icon={<BookIcon size={22} />}
          title={COPY.emptyTitle}
          description={COPY.emptyDescription}
        />
      </Card>
    </div>
  );
}
