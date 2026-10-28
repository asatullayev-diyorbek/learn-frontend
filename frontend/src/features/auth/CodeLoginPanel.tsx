import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { Button, ButtonLink } from "../../components/Button";
import { ClockIcon, ExternalIcon, TelegramIcon } from "../../components/icons";
import { TextField } from "../../components/TextField";
import { AUTH_COPY, CODE_ERROR_COPY } from "./copy";
import { sanitizeCode, type CodeView } from "./useCodeLogin";
import styles from "./LoginPanels.module.css";

const COPY = AUTH_COPY.code;

export interface CodeLoginPanelProps {
  view: CodeView;
  /** Plain https://t.me/<bot> link, derived from the token response. */
  botUrl: string | null;
  botUrlPending: boolean;
  onSubmit: (code: string) => Promise<boolean>;
  onEdit: () => void;
}

export function CodeLoginPanel({ view, botUrl, botUrlPending, onSubmit, onEdit }: CodeLoginPanelProps) {
  const [code, setCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const submitting = view.status === "submitting";
  const error = view.status === "error" ? CODE_ERROR_COPY[view.error] : undefined;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ok = await onSubmit(code);
    if (!ok) {
      // Keep what the user typed; put them right back on the field to fix it.
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  };

  return (
    <div className={styles.stack} data-testid="code-panel">
      <p className={styles.lead}>
        Telegram’da <code className={styles.command}>/login</code> yuboring — bot sizga 5 xonali
        kod beradi.
      </p>

      <ButtonLink
        variant="secondary"
        fullWidth
        href={botUrl ?? undefined}
        loading={!botUrl && botUrlPending}
        target="_blank"
        rel="noopener noreferrer"
        leadingIcon={<TelegramIcon size={20} className={styles.telegramIcon} />}
        trailingIcon={<ExternalIcon size={16} className={styles.externalIcon} />}
      >
        {COPY.openBot}
      </ButtonLink>

      <div className={styles.divider} aria-hidden="true" />

      <form className={styles.form} noValidate onSubmit={handleSubmit}>
        <TextField
          ref={inputRef}
          label={COPY.inputLabel}
          name="code"
          size="lg"
          inputClassName={styles.codeInput}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          // No maxLength: the browser would truncate a pasted "12 345" to
          // "12 34" before sanitizeCode() strips the space. sanitizeCode caps at 5.
          placeholder="•••••"
          spellCheck={false}
          value={code}
          error={error}
          readOnly={submitting}
          onChange={(event) => {
            setCode(sanitizeCode(event.target.value));
            onEdit();
          }}
        />

        <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting}>
          {submitting ? COPY.submitting : COPY.submit}
        </Button>

        <p className={styles.footnote}>
          <ClockIcon size={15} />
          {COPY.expiry}
        </p>
      </form>
    </div>
  );
}
