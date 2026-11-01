import { Link } from "react-router-dom";
import { ButtonRouterLink } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import {
  AwardIcon,
  BookIcon,
  ChevronRightIcon,
  GraduationCapIcon,
  SparklesIcon,
  TelegramIcon,
  VideoIcon,
} from "../../components/icons";
import { ROUTES } from "../../router/paths";
import type { CurrentUser } from "../../types/api";
import { getDisplayName } from "../auth/useCurrentUser";
import { CourseCard } from "../courses/CourseCard";
import { useMyCourses } from "../profile/useMyCourses";
import { HOME_COPY } from "./copy";
import styles from "./Home.module.css";

const COPY = HOME_COPY.member;
const BOT_URL = "https://t.me/learn_asatullayev_bot";

/**
 * Home for a signed-in user: an interactive student learning dashboard
 * combining catalog exploration, enrolled courses progress, and the
 * crowd-sourced video lesson submission workflow.
 */
export function MemberHome({ user }: { user: CurrentUser }) {
  const { view } = useMyCourses();
  const enrolledCourses = view.status === "ready" ? view.courses : [];

  return (
    <div className={styles.member} data-testid="home-member">
      {/* 1. Student Dashboard Hero Banner */}
      <section className={styles.memberHero} aria-label="O‘quvchi paneli">
        <div className={styles.memberHeroMain}>
          <div className={styles.memberBadge}>
            <SparklesIcon size={15} />
            <span>Shaxsiy o‘quv kabineti</span>
          </div>
          <h1 className={styles.pageTitle}>{COPY.welcome(getDisplayName(user))}</h1>
          <p className={styles.pageLead}>{COPY.lead}</p>

          <div className={styles.memberQuickActions}>
            <Link to={ROUTES.videos} className={styles.quickPill} tabIndex={-1}>
              <VideoIcon size={16} />
              <span>Mening videolarim</span>
              <ChevronRightIcon size={15} />
            </Link>
            <Link to={ROUTES.profile} className={styles.quickPillSecondary} tabIndex={-1}>
              <GraduationCapIcon size={16} />
              <span>Profil va kurslarim</span>
            </Link>
          </div>
        </div>

        <div className={styles.memberStatsGrid}>
          <div className={styles.memberStatCard}>
            <span className={styles.memberStatIcon}>
              <BookIcon size={20} />
            </span>
            <div>
              <strong className={styles.memberStatValue}>{enrolledCourses.length} ta</strong>
              <span className={styles.memberStatLabel}>Faol kurslaringiz</span>
            </div>
          </div>

          <div className={styles.memberStatCard}>
            <span className={`${styles.memberStatIcon} ${styles.memberStatIconTeal}`}>
              <VideoIcon size={20} />
            </span>
            <div>
              <strong className={styles.memberStatValue}>Hamkorlik</strong>
              <span className={styles.memberStatLabel}>Video darslik ulashish ochiq</span>
            </div>
          </div>

          <div className={styles.memberStatCard}>
            <span className={`${styles.memberStatIcon} ${styles.memberStatIconIndigo}`}>
              <AwardIcon size={20} />
            </span>
            <div>
              <strong className={styles.memberStatValue}>100% Amaliy</strong>
              <span className={styles.memberStatLabel}>Mustaqil o‘rganish tizimi</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Enrolled Courses Preview (if any) */}
      {enrolledCourses.length > 0 && (
        <section className={styles.memberSection} aria-labelledby="member-enrolled-heading">
          <div className={styles.memberSectionHeader}>
            <div>
              <span className={styles.sectionEyebrow}>Davom ettiring</span>
              <h2 id="member-enrolled-heading" className={styles.memberSectionTitle}>
                Mening faol kurslarim
              </h2>
            </div>
            <Link to={ROUTES.profile} className={styles.memberViewAll} tabIndex={-1}>
              <span>Barchasini ko‘rish ({enrolledCourses.length})</span>
              <ChevronRightIcon size={16} />
            </Link>
          </div>

          <div className={styles.coursesGrid}>
            {enrolledCourses.slice(0, 3).map((course) => (
              <CourseCard key={course.id} course={course} headingLevel={3} />
            ))}
          </div>
        </section>
      )}

      {/* 3. Main Dashboard Grid: Catalog Invite + Video Contribution Studio */}
      <div className={styles.memberSplitGrid}>
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

        <div className={styles.studioBanner}>
          <div className={styles.studioTop}>
            <span className={styles.studioTag}>
              <VideoIcon size={14} />
              Hamjamiyat darsliklari
            </span>
            <h2 className={styles.studioTitle}>Kursga video darslik qo‘shing</h2>
            <p className={styles.studioDesc}>
              Learn platformasida har bir o‘quvchi ustoz bo‘lishi mumkin! O‘zingiz yaxshi tushungan mavzu bo‘yicha video dars tayyorlang va YouTube kanalimizga hammuallif sifatida kiring.
            </p>
          </div>

          <ol className={styles.studioSteps}>
            <li>
              <span className={styles.studioStepNum}>1</span>
              <span>Telegram botga (<strong>@learn_asatullayev_bot</strong>) video yuboring</span>
            </li>
            <li>
              <span className={styles.studioStepNum}>2</span>
              <span><strong>Mening videolarim</strong> bo‘limida uni kurs mavzusiga biriktiring</span>
            </li>
            <li>
              <span className={styles.studioStepNum}>3</span>
              <span>Tasdiqlangach, darslik avtomatik YouTube pleylistga joylanadi</span>
            </li>
          </ol>

          <div className={styles.studioActions}>
            <Link to={ROUTES.videos} className={styles.studioPrimaryBtn} tabIndex={-1}>
              <VideoIcon size={17} />
              <span>Videolarimni boshqarish</span>
            </Link>
            <a
              href={BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.studioBotBtn}
              tabIndex={-1}
            >
              <TelegramIcon size={17} />
              <span>Telegram botni ochish</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
