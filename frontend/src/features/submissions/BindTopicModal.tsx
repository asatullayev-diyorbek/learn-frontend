import { useEffect, useId, useState } from "react";
import { Button } from "../../components/Button";
import type { AvailableCourseWithTopics, VideoSubmission } from "../../types/api";
import styles from "./BindTopicModal.module.css";

interface BindTopicModalProps {
  submission: VideoSubmission;
  availableCourses: AvailableCourseWithTopics[];
  onClose: () => void;
  onBind: (submissionId: number, topicId: number) => Promise<{ ok: boolean; error?: string }>;
}

export function BindTopicModal({
  submission,
  availableCourses,
  onClose,
  onBind,
}: BindTopicModalProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<number | "">("");
  const [selectedTopicId, setSelectedTopicId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const courseSelectId = useId();
  const topicSelectId = useId();

  // Find selected course to derive its topics
  const selectedCourse = availableCourses.find((c) => c.id === Number(selectedCourseId));
  const availableTopics = selectedCourse?.topics ?? [];

  // Reset selected topic when course changes
  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextCourseId = e.target.value ? Number(e.target.value) : "";
    setSelectedCourseId(nextCourseId);
    setSelectedTopicId("");
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopicId) {
      setError("Iltimos, darslik qaysi mavzuga tegishli ekanligini tanlang.");
      return;
    }

    setLoading(true);
    setError(null);
    const result = await onBind(submission.id, Number(selectedTopicId));
    setLoading(false);

    if (result.ok) {
      onClose();
    } else {
      setError(result.error ?? "Mavzuni biriktirishda xatolik yuz berdi.");
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>Mavzuni tanlang va biriktiring</h3>
            <p className={styles.subtitle}>
              Yuborgan videongiz qaysi kurs va qaysi mavzuga tegishli ekanligini belgilang.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.formGroup}>
          <div className={styles.formGroup}>
            <label htmlFor={courseSelectId} className={styles.label}>
              Kursni tanlang
            </label>
            <select
              id={courseSelectId}
              className={styles.select}
              value={selectedCourseId}
              onChange={handleCourseChange}
              required
            >
              <option value="">— Kurslar ro'yxati —</option>
              {availableCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.topics.length} ta mavzu)
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor={topicSelectId} className={styles.label}>
              Mavzuni (Topic) tanlang
            </label>
            <select
              id={topicSelectId}
              className={styles.select}
              value={selectedTopicId}
              onChange={(e) =>
                setSelectedTopicId(e.target.value ? Number(e.target.value) : "")
              }
              disabled={!selectedCourseId || availableTopics.length === 0}
              required
            >
              <option value="">
                {!selectedCourseId
                  ? "Avval kursni tanlang"
                  : availableTopics.length === 0
                  ? "Ushbu kursda mavzular mavjud emas"
                  : "— Mavzuni tanlang —"}
              </option>
              {availableTopics.map((t, idx) => (
                <option key={t.id} value={t.id}>
                  {idx + 1}-dars: {t.title}
                </option>
              ))}
            </select>
          </div>

          {error && <div className={styles.errorText}>{error}</div>}

          <div className={styles.actions}>
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Bekor qilish
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={!selectedTopicId}
            >
              Biriktirish va yuborish
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
