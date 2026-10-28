import { ButtonRouterLink } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { BookIcon } from "../../components/icons";
import { ROUTES } from "../../router/paths";
import type { CurrentUser } from "../../types/api";
import { getDisplayName } from "../auth/useCurrentUser";
import { HOME_COPY } from "./copy";
import styles from "./Home.module.css";

const COPY = HOME_COPY.member;

/**
 * Home for a signed-in user. There is no "my courses" endpoint yet, so the
 * card is an invitation into the catalog rather than a list.
 */
export function MemberHome({ user }: { user: CurrentUser }) {
  return (
    <div className={styles.member} data-testid="home-member">
      <div className={styles.memberIntro}>
        <h1 className={styles.pageTitle}>{COPY.welcome(getDisplayName(user))}</h1>
        <p className={styles.pageLead}>{COPY.lead}</p>
      </div>

      <Card className={styles.memberCard}>
        <EmptyState
          data-testid="courses-invite"
          tone="accent"
          icon={<BookIcon size={22} />}
          title={COPY.browseTitle}
          description={COPY.browseDescription}
          action={
            <ButtonRouterLink to={ROUTES.courses} variant="primary">
              {COPY.browseAction}
            </ButtonRouterLink>
          }
        />
      </Card>
    </div>
  );
}
