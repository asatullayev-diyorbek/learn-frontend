import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ButtonRouterLink } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { Skeleton } from "../components/Skeleton";
import {
  ArrowLeftIcon,
  BookIcon,
  ChevronRightIcon,
  PlayIcon,
  TelegramIcon,
  VideoIcon,
  YouTubeIcon,
} from "../components/icons";
import { CoursesError } from "../features/courses/CoursesStatus";
import { LevelBadge } from "../features/courses/CourseMeta";
import { initials } from "../features/courses/format";
import { useLessonDetail } from "../features/courses/useLessonDetail";
import { ROUTES } from "../router/paths";
import type { LessonVideo, LessonVideoAuthor, TopicDetail } from "../types/api";
import styles from "./LessonDetailPage.module.css";

const BOT_URL = "https://t.me/learn_asatullayev_bot";

function getAuthorDisplayName(author: LessonVideoAuthor): string {
  const fullName = [author.first_name, author.last_name].map((p) => p.trim()).join(" ").trim();
  if (fullName) return fullName;
  if (author.telegram_username) return `@${author.telegram_username.replace(/^@/, "")}`;
  return author.username || "O‘quvchi";
}

function LessonLoading() {
  return (
    <div className={styles.loadingWrap} aria-busy="true" data-testid="lesson-detail-loading">
      <Skeleton width={220} height={24} radius="sm" />
      <div className={styles.layout}>
        <div className={styles.mainCol}>
          <Skeleton width="100%" height={420} radius="md" />
          <Skeleton width="65%" height={32} radius="sm" />
          <Skeleton width="100%" height={120} radius="md" />
        </div>
        <div className={styles.sidebarCol}>
          <Skeleton width="100%" height={360} radius="md" />
        </div>
      </div>
    </div>
  );
}

function LessonNotFound({ slug }: { slug: string }) {
  return (
    <div className={styles.statusWrap} data-testid="lesson-not-found">
      <EmptyState
        headingLevel={1}
        icon={<BookIcon size={24} />}
        title="Dars mavzusi topilmadi"
        description="Siz qidirayotgan mavzu mavjud emas yoki o‘chirilgan bo‘lishi mumkin."
        action={
          <ButtonRouterLink to={slug ? ROUTES.courseDetail(slug) : ROUTES.courses} variant="primary">
            Kurs sahifasiga qaytish
          </ButtonRouterLink>
        }
      />
    </div>
  );
}

function LessonContentView({ lesson }: { lesson: TopicDetail }) {
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);

  const activeVideo: LessonVideo | null =
    lesson.videos.find((v) => v.id === selectedVideoId) ?? lesson.videos[0] ?? null;

  const currentIndex = lesson.topics.findIndex((t) => t.id === lesson.id);
  const lessonNumber = currentIndex >= 0 ? currentIndex + 1 : lesson.order || 1;

  return (
    <>
      {/* Breadcrumb & Top Bar */}
      <nav className={styles.breadcrumb} aria-label="Yo‘l ko‘rsatkichi">
        <Link to={ROUTES.courseDetail(lesson.course.slug)} className={styles.backToCourse}>
          <ArrowLeftIcon size={16} />
          <span>{lesson.course.title}</span>
        </Link>
        <span className={styles.crumbSep} aria-hidden="true">/</span>
        <span className={styles.crumbCurrent}>{lessonNumber}-dars</span>
      </nav>

      <div className={styles.layout} data-testid="lesson-detail">
        {/* Main Column: Video Player + Lesson Header + Prev/Next + Crowd Contribution */}
        <div className={styles.mainCol}>
          {/* 1. Video Stage */}
          <div className={styles.playerStage} data-testid="lesson-player-stage">
            {activeVideo ? (
              <div className={styles.iframeWrapper}>
                <iframe
                  className={styles.iframe}
                  src={activeVideo.embed_url}
                  title={`${lesson.title} — video darslik`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className={styles.emptyStage} data-testid="lesson-no-video">
                <div className={styles.emptyStageGlow} aria-hidden="true" />
                <div className={styles.emptyStageIcon}>
                  <VideoIcon size={32} />
                </div>
                <span className={styles.emptyStageBadge}>Birinchi muallif bo‘ling!</span>
                <h2 className={styles.emptyStageTitle}>
                  Ushbu mavzu bo‘yicha hali video darslik joylanmagan
                </h2>
                <p className={styles.emptyStageDesc}>
                  Learn platformasida darsliklar o‘quvchilar tomonidan yaratiladi. «{lesson.title}» mavzusini tushuntirib video yozing, Telegram botimizga yuboring va kursning rasmiy YouTube pleylistiga o‘z darsingizni qo‘shing!
                </p>
                <div className={styles.emptyStageActions}>
                  <a
                    href={BOT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.telegramBtn}
                  >
                    <TelegramIcon size={18} />
                    <span>Botga video yuborish</span>
                  </a>
                  <Link to={ROUTES.videos} className={styles.bindBtn}>
                    <VideoIcon size={18} />
                    <span>Mavzuga video biriktirish</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 2. If multiple community videos exist for this topic, let student switch */}
          {lesson.videos.length > 1 && (
            <div className={styles.videoSwitcher} data-testid="lesson-video-switcher">
              <span className={styles.switcherLabel}>
                Hamjamiyat darsliklari ({lesson.videos.length} ta variant):
              </span>
              <div className={styles.switcherPills}>
                {lesson.videos.map((v, idx) => {
                  const isCurrent = activeVideo?.id === v.id;
                  const authorName = getAuthorDisplayName(v.author);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      className={`${styles.switcherPill} ${isCurrent ? styles.switcherPillActive : ""}`}
                      onClick={() => setSelectedVideoId(v.id)}
                    >
                      <PlayIcon size={12} />
                      <span>
                        {idx + 1}-talqin ({authorName})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Lesson Info Card */}
          <section className={styles.lessonHeaderCard} aria-labelledby="lesson-title">
            <div className={styles.lessonEyebrow}>
              <span className={styles.lessonNumberBadge}>
                {String(lessonNumber).padStart(2, "0")}-dars
              </span>
              <span className={styles.courseCategory}>{lesson.course.category.name}</span>
              <LevelBadge level={lesson.course.level} />
            </div>

            <h1 id="lesson-title" className={styles.lessonTitle}>
              {lesson.title}
            </h1>

            {activeVideo && (
              <div className={styles.authorBar} data-testid="lesson-video-author">
                <div className={styles.authorLeft}>
                  <span className={styles.authorAvatar} aria-hidden="true">
                    {initials(getAuthorDisplayName(activeVideo.author))}
                  </span>
                  <div className={styles.authorMeta}>
                    <span className={styles.authorRole}>Darslik muallifi (Hamjamiyat a’zosi)</span>
                    <strong className={styles.authorName}>
                      {getAuthorDisplayName(activeVideo.author)}
                    </strong>
                  </div>
                </div>

                {activeVideo.youtube_url && (
                  <a
                    href={activeVideo.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.youtubeExternalBtn}
                  >
                    <YouTubeIcon size={16} />
                    <span>YouTube’da ochish</span>
                  </a>
                )}
              </div>
            )}

            {/* Prev / Next Lesson Controls */}
            <div className={styles.lessonPager}>
              {lesson.previous_topic_id ? (
                <Link
                  to={ROUTES.lessonDetail(lesson.course.slug, lesson.previous_topic_id)}
                  className={styles.pagerBtn}
                  data-testid="lesson-prev-link"
                >
                  <ArrowLeftIcon size={16} />
                  <div>
                    <span className={styles.pagerHint}>Oldingi mavzu</span>
                    <strong className={styles.pagerTitle}>
                      {lesson.topics.find((t) => t.id === lesson.previous_topic_id)?.title ??
                        "Oldingi dars"}
                    </strong>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {lesson.next_topic_id ? (
                <Link
                  to={ROUTES.lessonDetail(lesson.course.slug, lesson.next_topic_id)}
                  className={`${styles.pagerBtn} ${styles.pagerBtnNext}`}
                  data-testid="lesson-next-link"
                >
                  <div>
                    <span className={styles.pagerHint}>Keyingi mavzu</span>
                    <strong className={styles.pagerTitle}>
                      {lesson.topics.find((t) => t.id === lesson.next_topic_id)?.title ??
                        "Keyingi dars"}
                    </strong>
                  </div>
                  <ChevronRightIcon size={18} />
                </Link>
              ) : (
                <div />
              )}
            </div>
          </section>

          {/* 4. Contribute Another Video Banner */}
          <section className={styles.contributeCard} aria-label="Video darslik qo‘shish">
            <div className={styles.contributeInfo}>
              <div className={styles.contributeIconBox}>
                <VideoIcon size={20} />
              </div>
              <div>
                <h2 className={styles.contributeHeading}>
                  Shu mavzuni o‘z uslubingizda tushuntira olasizmi?
                </h2>
                <p className={styles.contributeSub}>
                  O‘z video darsligingizni Telegram botga yuboring va «{lesson.title}» mavzusiga biriktiring. Admin tasdiqlagach, darsingiz shu sahifada va YouTube’da chiqadi.
                </p>
              </div>
            </div>
            <div className={styles.contributeBtns}>
              <Link to={ROUTES.videos} className={styles.contributePrimary}>
                <VideoIcon size={16} />
                <span>Videolarim sahifasi</span>
              </Link>
              <a
                href={BOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contributeSecondary}
              >
                <TelegramIcon size={16} />
                <span>@learn_asatullayev_bot</span>
              </a>
            </div>
          </section>
        </div>

        {/* Sidebar Column: Full Course Curriculum */}
        <aside className={styles.sidebarCol} aria-labelledby="curriculum-heading">
          <div className={styles.curriculumCard}>
            <div className={styles.curriculumHeader}>
              <div>
                <span className={styles.curriculumEyebrow}>Kurs mundarijasi</span>
                <h2 id="curriculum-heading" className={styles.curriculumTitle}>
                  {lesson.course.title}
                </h2>
              </div>
              <span className={styles.curriculumCount}>{lesson.topics.length} ta dars</span>
            </div>

            <ol className={styles.curriculumList} data-testid="lesson-sidebar-topics">
              {lesson.topics.map((item, idx) => {
                const isActive = item.id === lesson.id;
                return (
                  <li key={item.id}>
                    <Link
                      to={ROUTES.lessonDetail(lesson.course.slug, item.id)}
                      className={`${styles.curriculumItem} ${isActive ? styles.curriculumItemActive : ""}`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className={styles.curriculumIndex}>
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className={styles.curriculumItemText}>{item.title}</span>
                      {item.video_count > 0 && (
                        <span className={styles.curriculumVideoBadge} title="Video darslik mavjud">
                          <PlayIcon size={10} />
                          {item.video_count}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ol>

            <div className={styles.curriculumFooter}>
              <Link to={ROUTES.courseDetail(lesson.course.slug)} className={styles.courseOverviewLink}>
                <BookIcon size={15} />
                <span>Kurs tavsifi va ustoz haqida</span>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

export function LessonDetailPage() {
  const { slug = "", topicId = "" } = useParams<{ slug: string; topicId: string }>();
  const { view, retry } = useLessonDetail(slug, topicId);

  return (
    <div className={styles.page} data-testid="lesson-detail-page" data-status={view.status}>
      <title>
        {view.status === "ready"
          ? `${view.lesson.title} — ${view.lesson.course.title} | Learn`
          : view.status === "not_found"
            ? "Dars topilmadi — Learn"
            : "Yuklanmoqda… — Learn"}
      </title>

      {view.status === "loading" && <LessonLoading />}
      {view.status === "ready" && <LessonContentView lesson={view.lesson} />}
      {view.status === "not_found" && <LessonNotFound slug={slug} />}
      {view.status === "error" && (
        <CoursesError error={view.error} onRetry={retry} headingLevel={1} testId="lesson-error" />
      )}
    </div>
  );
}
