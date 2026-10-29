import { Link, NavLink, Outlet, ScrollRestoration } from "react-router-dom";
import { BrandMark } from "../components/BrandMark";
import { AccountControls } from "../features/auth/AccountControls";
import { CurrentUserProvider } from "../features/auth/CurrentUserProvider";
import { SignOutFeedback } from "../features/auth/SignOutFeedback";
import { ROUTES } from "../router/paths";
import styles from "./SiteLayout.module.css";

/**
 * Shell for regular site pages (home, course catalog, course pages, profile): header
 * with brand + "Kurslar" nav + account slot, page content, minimal footer.
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
            <div className={styles.start}>
              <Link to={ROUTES.home} className={styles.brandLink} aria-label="Learn — bosh sahifa">
                <BrandMark />
              </Link>
              <nav aria-label="Asosiy" className={styles.nav}>
                <NavLink to={ROUTES.courses} className={styles.navLink}>
                  Kurslar
                </NavLink>
              </nav>
            </div>
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
      {/* New page → top of the page; back/forward → where you were. */}
      <ScrollRestoration />
    </CurrentUserProvider>
  );
}
