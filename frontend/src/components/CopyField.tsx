import { useId } from "react";
import { useClipboard } from "../hooks/useClipboard";
import { IconButton } from "./IconButton";
import { CheckIcon, CopyIcon } from "./icons";
import styles from "./CopyField.module.css";

export interface CopyFieldProps {
  label: string;
  value: string;
  copyLabel?: string;
  copiedLabel?: string;
}

/**
 * Read-only value with a copy action. The "copied" feedback lives in a
 * role="status" element so it is announced without moving focus.
 */
export function CopyField({
  label,
  value,
  copyLabel = "Nusxalash",
  copiedLabel = "Nusxalandi!",
}: CopyFieldProps) {
  const id = useId();
  const { copied, copy } = useClipboard();

  return (
    <div className={styles.field} role="group" aria-labelledby={`${id}-label`}>
      <span id={`${id}-label`} className={styles.label}>
        {label}
      </span>
      <div className={styles.box} data-copied={copied || undefined}>
        <code
          className={styles.value}
          data-testid="copy-field-value"
          title={value}
        >
          {value}
        </code>
        <span role="status" className={styles.feedback} data-visible={copied || undefined}>
          {copied ? copiedLabel : ""}
        </span>
        <IconButton
          aria-label={copied ? copiedLabel : `${label}: ${copyLabel.toLowerCase()}`}
          title={copyLabel}
          tone={copied ? "success" : "neutral"}
          icon={copied ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
          onClick={() => void copy(value)}
        />
      </div>
    </div>
  );
}
