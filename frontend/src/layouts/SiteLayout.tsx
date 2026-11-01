import { Link, NavLink, Outlet, ScrollRestoration } from "react-router-dom";
import { BrandMark } from "../components/BrandMark";
import { ThemeToggle } from "../components/ThemeToggle";
import { TelegramIcon, BookIcon, VideoIcon } from "../components/icons";
import { AccountControls } from "../features/auth/AccountControls";
import { CurrentUserProvider } from "../features/auth/CurrentUserProvider";
import { SignOutFeedback } from "../features/auth/SignOutFeedback";
import { ROUTES } from "../router/paths";
import styles from "./SiteLayout.module.css";

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
                  <BookIcon size={16} />
                  <span>Kurslar</span>
                </NavLink>
                <NavLink to={ROUTES.videos} className={`${styles.navLink} ${styles.navExtra}`} tabIndex={-1}>
                  <VideoIcon size={16} />
                  <span>Videolar</span>
                </NavLink>
              </nav>
            </div>
            <div className={styles.end}>
              <ThemeToggle />
              <AccountControls />
            </div>
          </div>
        </header>

        <main className={styles.main}>
          <SignOutFeedback className={styles.notice} />
          <Outlet />
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.footerMain}>
              <div className={styles.brandCol}>
                <BrandMark />
                <p className={styles.brandDesc}>
                  O'zbek tilidagi zamonaviy dasturlash kurslari. Noldan boshlab professional darajagacha amaliy bilimlar.
                </p>
                <div className={styles.telegramBadge}>
                  <TelegramIcon size={16} />
                  <span>Telegram bilan 100% himoyalangan parolsiz kirish</span>
                </div>
              </div>

              <div className={styles.footerCol}>
                <h4 className={styles.colTitle}>Katalog</h4>
                <ul className={styles.colList}>
                  <li><Link to={`${ROUTES.courses}?category=backend`}>Backend dasturlash</Link></li>
                  <li><Link to={`${ROUTES.courses}?category=frontend`}>Frontend dasturlash</Link></li>
                  <li><Link to={`${ROUTES.courses}?category=malumotlar-bazalari`}>Ma'lumotlar bazalari</Link></li>
                  <li><Link to={`${ROUTES.courses}?category=mobil-dasturlash`}>Mobil dasturlash</Link></li>
                </ul>
              </div>

              <div className={styles.footerCol}>
                <h4 className={styles.colTitle}>Platforma</h4>
                <ul className={styles.colList}>
                  <li><Link to={ROUTES.home}>Bosh sahifa</Link></li>
                  <li><Link to={ROUTES.courses}>Kurslar katalogi</Link></li>
                  <li><Link to={ROUTES.videos}>Mening videolarim</Link></li>
                  <li><Link to={ROUTES.profile}>Mening profilim</Link></li>
                </ul>
              </div>
            </div>

            <div className={styles.footerBottom}>
              <p>© {new Date().getFullYear()} Learn Platformasi. Barcha huquqlar himoyalangan.</p>
              <p className={styles.footerNote}>Amaliy dasturlash maktabi</p>
            </div>
          </div>
        </footer>
      </div>
      <ScrollRestoration />
    </CurrentUserProvider>
  );
}
