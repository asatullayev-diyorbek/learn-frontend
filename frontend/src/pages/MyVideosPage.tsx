import { useMemo, useState } from "react";
import { Button, ButtonRouterLink } from "../components/Button";
import { Skeleton } from "../components/Skeleton";
import {
  AlertCircleIcon,
  RefreshIcon,
  TelegramIcon,
  VideoIcon,
} from "../components/icons";
import { useCurrentUser } from "../features/auth/useCurrentUser";
import { BindTopicModal } from "../features/submissions/BindTopicModal";
import { useSubmissions } from "../features/submissions/useSubmissions";
import { VideoSubmissionCard } from "../features/submissions/VideoSubmissionCard";
import { loginWithNext, ROUTES } from "../router/paths";
import type { SubmissionStatus, VideoSubmission } from "../types/api";
import styles from "./MyVideosPage.module.css";

type TabFilter = "all" | SubmissionStatus;

const BOT_USERNAME = "learn_asatullayev_bot";
const BOT_URL = `https://t.me/${BOT_USERNAME}`;

export function MyVideosPage() {
  const session = useCurrentUser();
  const {
    submissions,
    availableCourses,
    loading,
    error,
    refresh,
    bindTopic,
  } = useSubmissions();

  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [bindingSubmission, setBindingSubmission] = useState<VideoSubmission | null>(null);

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    if (activeTab === "all") return submissions;
    return submissions.filter((s) => s.status === activeTab);
  }, [submissions, activeTab]);

  // Counts for tabs
  const counts = useMemo(() => {
    const res: Record<TabFilter, number> = {
      all: submissions.length,
      awaiting_topic: 0,
      pending_review: 0,
      approved: 0,
      rejected: 0,
    };
    for (const s of submissions) {
      if (res[s.status] !== undefined) {
        res[s.status]++;
      }
    }
    return res;
  }, [submissions]);

  // Guest view
  if (session.status === "guest") {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon}>
              <VideoIcon size={28} />
            </div>
            <h2 className={styles.emptyTitle}>Tizimga kiring</h2>
            <p className={styles.emptyDesc}>
              Videolaringizni ko'rish va yangi darsliklar topshirish uchun avval Telegram orqali
              profilingizga kiring.
            </p>
            <ButtonRouterLink
              to={loginWithNext(ROUTES.videos)}
              variant="primary"
            >
              Telegram orqali kirish
            </ButtonRouterLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Hero banner */}
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>
              <VideoIcon size={14} />
              O'quvchilar kontenti
            </span>
            <h1 className={styles.title}>Mening videolarim</h1>
            <p className={styles.description}>
              Learn — bu o'quvchilar birgalikda yaratadigan ta'lim platformasi. Siz ham
              Telegram botimizga darslik yuboring va kurs mavzusiga biriktirib, platformaga hissa
              qo'shing!
            </p>
          </div>

          <div className={styles.heroActions}>
            <a
              href={BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.botButton}
            >
              <TelegramIcon size={18} />
              Botga video yuborish
            </a>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void refresh()}
              disabled={loading}
              aria-label="Ro'yxatni yangilash"
            >
              <RefreshIcon size={16} />
              Yangilash
            </Button>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className={styles.errorBanner}>
            <span>{error}</span>
            <Button type="button" variant="ghost" onClick={() => void refresh()}>
              Qaytadan urinish
            </Button>
          </div>
        )}

        {/* Filter bar */}
        <div className={styles.filterBar}>
          <div className={styles.tabs} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "all"}
              className={`${styles.tab} ${activeTab === "all" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("all")}
            >
              Barchasi <span className={styles.tabCount}>{counts.all}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "awaiting_topic"}
              className={`${styles.tab} ${activeTab === "awaiting_topic" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("awaiting_topic")}
            >
              Mavzu tanlanmagan{" "}
              <span className={styles.tabCount}>{counts.awaiting_topic}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "pending_review"}
              className={`${styles.tab} ${activeTab === "pending_review" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("pending_review")}
            >
              Ko'rib chiqilmoqda{" "}
              <span className={styles.tabCount}>{counts.pending_review}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "approved"}
              className={`${styles.tab} ${activeTab === "approved" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("approved")}
            >
              Tasdiqlangan{" "}
              <span className={styles.tabCount}>{counts.approved}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "rejected"}
              className={`${styles.tab} ${activeTab === "rejected" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("rejected")}
            >
              Rad etilgan{" "}
              <span className={styles.tabCount}>{counts.rejected}</span>
            </button>
          </div>
        </div>

        {/* Submissions list / loading state / empty state */}
        {loading ? (
          <div className={styles.grid}>
            <Skeleton height={200} radius="md" />
            <Skeleton height={200} radius="md" />
            <Skeleton height={200} radius="md" />
          </div>
        ) : filteredSubmissions.length > 0 ? (
          <div className={styles.grid}>
            {filteredSubmissions.map((sub) => (
              <VideoSubmissionCard
                key={sub.id}
                submission={sub}
                onOpenBindModal={(s) => setBindingSubmission(s)}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon}>
              {activeTab === "rejected" ? (
                <AlertCircleIcon size={28} />
              ) : (
                <VideoIcon size={28} />
              )}
            </div>
            <h3 className={styles.emptyTitle}>
              {activeTab === "all"
                ? "Hali videolar yubormagansiz"
                : activeTab === "awaiting_topic"
                ? "Mavzusi tanlanmagan videolar yo'q"
                : activeTab === "pending_review"
                ? "Ko'rib chiqilayotgan videolar yo'q"
                : activeTab === "approved"
                ? "Tasdiqlangan videolar yo'q"
                : "Rad etilgan videolar yo'q"}
            </h3>
            <p className={styles.emptyDesc}>
              O'zingiz qiziqqan mavzu bo'yicha tushunarli video darslik yozib oling va uni
              Telegram botimizga yuboring.
            </p>

            <div className={styles.stepsList}>
              <div className={styles.stepItem}>
                <span className={styles.stepNumber}>1</span>
                <span>Telegram botga (@{BOT_USERNAME}) video yuboring</span>
              </div>
              <div className={styles.stepItem}>
                <span className={styles.stepNumber}>2</span>
                <span>Ushbu sahifaga kelib, videoni kurs mavzusiga biriktiring</span>
              </div>
              <div className={styles.stepItem}>
                <span className={styles.stepNumber}>3</span>
                <span>Adminlar tasdiqlagach, video avtomatik YouTube'ga joylanadi</span>
              </div>
            </div>

            <a
              href={BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.botButton}
            >
              <TelegramIcon size={18} />
              Birinchi videoni yuborish
            </a>
          </div>
        )}

        {/* Modal for binding topic */}
        {bindingSubmission && (
          <BindTopicModal
            submission={bindingSubmission}
            availableCourses={availableCourses}
            onClose={() => setBindingSubmission(null)}
            onBind={bindTopic}
          />
        )}
      </div>
    </div>
  );
}
