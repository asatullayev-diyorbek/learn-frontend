import { Link, Outlet } from "react-router-dom";
import { BrandMark } from "../components/BrandMark";
import { AccountControls } from "../features/auth/AccountControls";
import { CurrentUserProvider } from "../features/auth/CurrentUserProvider";
import { SignOutFeedback } from "../features/auth/SignOutFeedback";
import { ROUTES } from "../router/paths";
import styles from "./SiteLayout.module.css";

/**
 * Shell for regular site pages (home now; courses, profile… later): header
 * with brand + account slot, page content, minimal footer.
 *
 * It owns the CurrentUserProvider, so /me is fetched once per visit to the
 * site section — and afresh after coming back from /login, which uses the
 * focused AuthLayout instead and never needs to know who is signed in.
 */
export function SiteLayout() {
  return (
    <CurrentUserProvider>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.bar}>
            <Link to={ROUTES.home} className={styles.brandLink} aria-label="Learn — bosh sahifa">
              <BrandMark />
            </Link>
            <AccountControls />
          </div>
        </header>

        <main className={styles.main}>
          <SignOutFeedback className={styles.notice} />
          <Outlet />
        </main>

        <footer className={styles.footer}>
          <div className={styles.bar}>
            <p>© {new Date().getFullYear()} Learn</p>
            <p>Onlayn ta’lim platformasi</p>
          </div>
        </footer>
      </div>
    </CurrentUserProvider>
  );
}
