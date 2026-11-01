import { Button } from "../../components/Button";
import {
  AlertCircleIcon,
  CheckIcon,
  ClockIcon,
  VideoIcon,
  YouTubeIcon,
} from "../../components/icons";
import type { VideoSubmission } from "../../types/api";
import styles from "./VideoSubmissionCard.module.css";

interface VideoSubmissionCardProps {
  submission: VideoSubmission;
  onOpenBindModal: (submission: VideoSubmission) => void;
}

export function VideoSubmissionCard({
  submission,
  onOpenBindModal,
}: VideoSubmissionCardProps) {
  const isAwaiting = submission.status === "awaiting_topic";
  const isPending = submission.status === "pending_review";
  const isApproved = submission.status === "approved";
  const isRejected = submission.status === "rejected";

  const formattedDate = new Date(submission.created_at).toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.statusWrapper}>
          {isAwaiting && (
            <span className={`${styles.badge} ${styles.badgeAwaiting}`}>
              <ClockIcon size={14} />
              Mavzu tanlanmagan
            </span>
          )}
          {isPending && (
            <span className={`${styles.badge} ${styles.badgePending}`}>
              <ClockIcon size={14} />
              Ko'rib chiqilmoqda
            </span>
          )}
          {isApproved && (
            <span className={`${styles.badge} ${styles.badgeApproved}`}>
              <CheckIcon size={14} />
              Tasdiqlangan
            </span>
          )}
          {isRejected && (
            <span className={`${styles.badge} ${styles.badgeRejected}`}>
              <AlertCircleIcon size={14} />
              Rad etilgan
            </span>
          )}
        </div>
        <span className={styles.date}>{formattedDate}</span>
      </div>

      {submission.topic ? (
        <div className={styles.topicInfo}>
          <span className={styles.courseName}>{submission.topic.course.title}</span>
          <h4 className={styles.topicTitle}>
            {submission.topic.order}-dars: {submission.topic.title}
          </h4>
        </div>
      ) : (
        <div className={styles.unboundNotice}>
          <span className={styles.unboundText}>
            Ushbu video Telegram botdan qabul qilindi, lekin hali biror kurs mavzusiga
            biriktirilmagan.
          </span>
          <div>
            <Button
              type="button"
              variant="primary"
              onClick={() => onOpenBindModal(submission)}
            >
              <VideoIcon size={16} />
              Mavzuga biriktirish
            </Button>
          </div>
        </div>
      )}

      {isApproved && (
        <div className={styles.approvalBox}>
          <p className={styles.approvalText}>
            🎉 Tabriklaymiz! Ushbu darslik ma'qullandi va kurs dasturiga kiritildi.
          </p>
          <div className={styles.collaboratorTip}>
            Kanalga rasmiy hamkor (collaborator) bo'lib qo'shilish uchun administrator bilan bog'laning.
          </div>
        </div>
      )}

      {isRejected && (
        <div className={styles.rejectionBox}>
          <span className={styles.rejectionTitle}>Rad etilish sababi:</span>
          <p className={styles.rejectionReason}>
            {submission.rejection_reason || "Belgilangan sifat talablariga javob bermadi."}
          </p>
        </div>
      )}

      <div className={styles.cardFooter}>
        <span className={styles.date}>ID: #{submission.id}</span>
        {submission.youtube_url && (
          <a
            href={submission.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.youtubeBtn}
          >
            <YouTubeIcon size={16} />
            YouTube'da ko'rish
          </a>
        )}
      </div>
    </div>
  );
}

