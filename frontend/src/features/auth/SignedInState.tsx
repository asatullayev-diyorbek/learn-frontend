import { EmptyState } from "../../components/EmptyState";
import { CheckIcon } from "../../components/icons";
import { Spinner } from "../../components/Spinner";
import { AUTH_COPY } from "./copy";
import styles from "./SignedInState.module.css";

export function SignedInState() {
  return (
    <EmptyState
      data-testid="signed-in"
      tone="success"
      headingLevel={1}
      icon={<CheckIcon size={24} strokeWidth={2.25} />}
      title={AUTH_COPY.success.title}
      description={
        <span className={styles.redirecting}>
          <Spinner size={14} />
          {AUTH_COPY.success.description}
        </span>
      }
    />
  );
}
