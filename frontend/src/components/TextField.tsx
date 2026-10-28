import type { ComponentProps, ReactNode } from "react";
import { useId } from "react";
import { AlertCircleIcon } from "./icons";
import styles from "./TextField.module.css";

export interface TextFieldProps extends Omit<ComponentProps<"input">, "size"> {
  label: ReactNode;
  /** Helper text shown under the input; replaced by `error` when present. */
  hint?: ReactNode;
  error?: ReactNode;
  size?: "md" | "lg";
  inputClassName?: string;
}

/**
 * Labelled text input. Wires up <label htmlFor>, aria-describedby and
 * aria-invalid so hints and errors are read with the field.
 */
export function TextField({
  label,
  hint,
  error,
  size = "md",
  id,
  className,
  inputClassName,
  ...rest
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const message = error ?? hint;

  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <input
        id={inputId}
        className={[styles.input, styles[size], inputClassName].filter(Boolean).join(" ")}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        {...rest}
      />
      {message && (
        <p id={messageId} className={error ? styles.error : styles.hint}>
          {error && <AlertCircleIcon size={16} className={styles.messageIcon} />}
          <span>{message}</span>
        </p>
      )}
    </div>
  );
}
