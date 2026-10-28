import type { ComponentProps, ReactNode } from "react";
import { Spinner } from "./Spinner";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "lg";

interface StyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

function classes({ variant = "primary", size = "md", fullWidth }: StyleProps, extra?: string) {
  return [styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, extra]
    .filter(Boolean)
    .join(" ");
}

function Content({
  leadingIcon,
  trailingIcon,
  loading,
  children,
}: Pick<StyleProps, "leadingIcon" | "trailingIcon"> & { loading?: boolean; children: ReactNode }) {
  const lead = loading ? <Spinner size={16} /> : leadingIcon;
  return (
    <>
      {lead && <span className={styles.icon}>{lead}</span>}
      <span className={styles.label}>{children}</span>
      {trailingIcon && !loading && <span className={styles.icon}>{trailingIcon}</span>}
    </>
  );
}

export interface ButtonProps extends ComponentProps<"button">, StyleProps {
  /** Shows a spinner, disables the button and marks it aria-busy. */
  loading?: boolean;
}

export function Button({
  variant,
  size,
  fullWidth,
  leadingIcon,
  trailingIcon,
  loading = false,
  disabled,
  className,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classes({ variant, size, fullWidth }, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <Content leadingIcon={leadingIcon} trailingIcon={trailingIcon} loading={loading}>
        {children}
      </Content>
    </button>
  );
}

export interface ButtonLinkProps extends ComponentProps<"a">, StyleProps {
  /** Without an href the link renders in a disabled, non-interactive state. */
  href?: string;
  loading?: boolean;
}

/** An <a> that looks like a Button — for navigation, never for actions. */
export function ButtonLink({
  variant,
  size,
  fullWidth,
  leadingIcon,
  trailingIcon,
  loading = false,
  href,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  const unavailable = !href || loading;
  return (
    <a
      className={classes({ variant, size, fullWidth }, className)}
      href={unavailable ? undefined : href}
      aria-disabled={unavailable || undefined}
      aria-busy={loading || undefined}
      {...rest}
    >
      <Content leadingIcon={leadingIcon} trailingIcon={trailingIcon} loading={loading}>
        {children}
      </Content>
    </a>
  );
}
