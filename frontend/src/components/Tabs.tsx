/*
 * Accessible tabs (WAI-ARIA APG "tabs with automatic activation"):
 *   - role="tablist" / "tab" / "tabpanel" with aria-selected/controls/labelledby
 *   - roving tabindex: only the selected tab is in the Tab order
 *   - ←/→ (wrapping), Home and End move focus and select
 *   - inactive panels stay mounted but `hidden`, so form state survives
 *     switching back and forth.
 */
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { createContext, useContext, useId } from "react";
import styles from "./Tabs.module.css";

interface TabsContextValue {
  baseId: string;
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs.* components must be rendered inside <Tabs>");
  return ctx;
}

const tabId = (base: string, value: string) => `${base}-tab-${value}`;
const panelId = (base: string, value: string) => `${base}-panel-${value}`;

export interface TabsProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs<T extends string>({ value, onValueChange, children, className }: TabsProps<T>) {
  const baseId = useId();
  return (
    <TabsContext.Provider
      value={{ baseId, value, onValueChange: onValueChange as (value: string) => void }}
    >
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabListProps {
  "aria-label": string;
  /** Values in visual order — drives the sliding indicator and key handling. */
  values: readonly string[];
  children: ReactNode;
}

export function TabList({ values, children, "aria-label": ariaLabel }: TabListProps) {
  const { baseId, value, onValueChange } = useTabs();
  const index = Math.max(0, values.indexOf(value));

  const select = (next: string | undefined) => {
    if (next === undefined) return;
    onValueChange(next);
    document.getElementById(tabId(baseId, next))?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = values.length - 1;
    switch (event.key) {
      case "ArrowRight":
        select(values[index === last ? 0 : index + 1]);
        break;
      case "ArrowLeft":
        select(values[index === 0 ? last : index - 1]);
        break;
      case "Home":
        select(values[0]);
        break;
      case "End":
        select(values[last]);
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation="horizontal"
      className={styles.list}
      onKeyDown={onKeyDown}
      style={
        {
          "--tab-count": values.length,
          "--tab-index": index,
        } as CSSProperties
      }
    >
      <span className={styles.indicator} aria-hidden="true" />
      {children}
    </div>
  );
}

export interface TabProps {
  value: string;
  children: ReactNode;
  icon?: ReactNode;
}

export function Tab({ value, children, icon }: TabProps) {
  const { baseId, value: selected, onValueChange } = useTabs();
  const isSelected = value === selected;
  return (
    <button
      type="button"
      role="tab"
      id={tabId(baseId, value)}
      aria-selected={isSelected}
      aria-controls={panelId(baseId, value)}
      tabIndex={isSelected ? 0 : -1}
      className={styles.tab}
      onClick={() => onValueChange(value)}
    >
      {icon && <span className={styles.tabIcon}>{icon}</span>}
      {children}
    </button>
  );
}

export interface TabPanelProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabPanel({ value, children, className }: TabPanelProps) {
  const { baseId, value: selected } = useTabs();
  const isSelected = value === selected;
  return (
    <div
      role="tabpanel"
      id={panelId(baseId, value)}
      aria-labelledby={tabId(baseId, value)}
      tabIndex={0}
      hidden={!isSelected}
      className={[styles.panel, className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}
