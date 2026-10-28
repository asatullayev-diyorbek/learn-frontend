import { useEffect, useEffectEvent, useId, useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { RefreshIcon, SearchIcon } from "../../components/icons";
import { Skeleton } from "../../components/Skeleton";
import { COURSE_LEVELS, COURSES_COPY, LEVEL_LABELS } from "./copy";
import type { CategoriesState } from "./useCategories";
import type { CourseFilters as Filters } from "./useCourseFilters";
import styles from "./Courses.module.css";

const COPY = COURSES_COPY.filters;

/** How long typing must pause before the search hits the URL (and the API). */
export const SEARCH_DEBOUNCE_MS = 300;

interface ChipOption {
  value: string;
  label: string;
  count?: number;
}

/**
 * Single-select chip row built on native radio inputs: Tab enters the group
 * at the checked chip, arrow keys move between (and select) chips — no
 * custom key handling to get wrong.
 */
function ChipGroup({
  label,
  name,
  value,
  options,
  onChange,
  testId,
}: {
  label: string;
  name: string;
  value: string;
  options: ChipOption[];
  onChange: (value: string) => void;
  testId: string;
}) {
  const labelId = useId();
  return (
    <div className={styles.filterRow}>
      <span id={labelId} className={styles.filterLabel}>
        {label}
      </span>
      <div role="radiogroup" aria-labelledby={labelId} className={styles.chips} data-testid={testId}>
        {options.map((option) => (
          <label key={option.value || "all"} className={styles.chip}>
            <input
              type="radio"
              className={styles.chipInput}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
            {option.count !== undefined && (
              <span className={styles.chipCount} aria-hidden="true">
                {option.count}
              </span>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}

/**
 * Search box with a debounced commit. The draft is local; the URL only
 * changes once typing pauses (or on Enter). If the URL changes from outside —
 * "Filtrlarni tozalash", back/forward — the draft follows it.
 */
function SearchBox({ value, onCommit }: { value: string; onCommit: (value: string) => void }) {
  const inputId = useId();
  const [draft, setDraft] = useState(value);
  const [lastValue, setLastValue] = useState(value);

  if (value !== lastValue) {
    setLastValue(value);
    if (value !== draft.trim()) setDraft(value);
  }

  // Re-renders of the parent (results arriving) must not restart the timer.
  const commit = useEffectEvent((next: string) => onCommit(next));

  useEffect(() => {
    const next = draft.trim();
    if (next === value) return;
    const timer = window.setTimeout(() => commit(next), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [draft, value]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next = draft.trim();
    if (next !== value) onCommit(next);
  };

  return (
    <form role="search" className={styles.search} onSubmit={onSubmit}>
      <label htmlFor={inputId} className="sr-only">
        {COPY.search}
      </label>
      <SearchIcon size={18} className={styles.searchIcon} />
      <input
        id={inputId}
        type="search"
        className={styles.searchInput}
        placeholder={COPY.searchPlaceholder}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        autoComplete="off"
        enterKeyHint="search"
        spellCheck={false}
      />
    </form>
  );
}

export interface CourseFiltersProps {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  categories: CategoriesState;
  onRetryCategories: () => void;
}

export function CourseFilters({ filters, onChange, categories, onRetryCategories }: CourseFiltersProps) {
  const levelOptions: ChipOption[] = [
    { value: "", label: COPY.all },
    ...COURSE_LEVELS.map((level) => ({ value: level, label: LEVEL_LABELS[level] })),
  ];

  return (
    <section className={styles.filters} aria-label={COPY.label}>
      <SearchBox value={filters.search} onCommit={(search) => onChange({ search })} />

      {categories.status === "ready" && (
        <ChipGroup
          label={COPY.category}
          name="category"
          testId="category-filter"
          value={filters.category}
          onChange={(category) => onChange({ category })}
          options={[
            { value: "", label: COPY.all },
            ...categories.categories.map((c) => ({
              value: c.slug,
              label: c.name,
              count: c.course_count,
            })),
          ]}
        />
      )}

      {categories.status === "loading" && (
        <div className={styles.filterRow} aria-hidden="true" data-testid="category-filter-loading">
          <span className={styles.filterLabel}>{COPY.category}</span>
          <div className={styles.chips}>
            {[72, 96, 84, 108].map((width, i) => (
              <Skeleton key={i} width={width} height="var(--control-height-sm)" radius="full" />
            ))}
          </div>
        </div>
      )}

      {categories.status === "error" && (
        <div className={styles.filterRow} data-testid="category-filter-error">
          <span className={styles.filterLabel}>{COPY.category}</span>
          <p className={styles.filterError}>
            {COPY.categoriesFailed}
            <Button variant="ghost" leadingIcon={<RefreshIcon size={16} />} onClick={onRetryCategories}>
              {COURSES_COPY.retry}
            </Button>
          </p>
        </div>
      )}

      <ChipGroup
        label={COPY.level}
        name="level"
        testId="level-filter"
        value={filters.level}
        onChange={(level) => onChange({ level: level as Filters["level"] })}
        options={levelOptions}
      />
    </section>
  );
}
