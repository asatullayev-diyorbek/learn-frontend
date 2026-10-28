import { Navigate, useLocation } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { CheckIcon } from "../components/icons";
import { AuthLayout } from "../layouts/AuthLayout";
import { ROUTES } from "../router/paths";

/*
 * Temporary stand-in for the home page (out of scope for now). It only
 * renders right after a successful login; anyone else is sent to /login.
 * A real auth guard arrives together with the real home page.
 */
export function HomePlaceholderPage() {
  const location = useLocation();
  const justSignedIn = (location.state as { signedIn?: boolean } | null)?.signedIn === true;

  if (!justSignedIn) return <Navigate to={ROUTES.login} replace />;

  return (
    <AuthLayout>
      <title>Learn</title>
      <EmptyState
        data-testid="home-placeholder"
        headingLevel={1}
        tone="success"
        icon={<CheckIcon size={24} strokeWidth={2.25} />}
        title="Siz tizimga kirdingiz"
        description="Bosh sahifa tez orada shu yerda bo‘ladi."
      />
    </AuthLayout>
  );
}
