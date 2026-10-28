import { useCurrentUser } from "../features/auth/useCurrentUser";
import { HOME_COPY } from "../features/home/copy";
import { GuestLanding } from "../features/home/GuestLanding";
import { HomeError, HomeLoading } from "../features/home/HomeStatus";
import { MemberHome } from "../features/home/MemberHome";

/** "/" — landing page for guests, personal home for signed-in users. */
export function HomePage() {
  const session = useCurrentUser();

  return (
    <>
      <title>{HOME_COPY.pageTitle}</title>
      {session.status === "loading" && <HomeLoading />}
      {session.status === "error" && <HomeError error={session.error} onRetry={session.retry} />}
      {session.status === "guest" && <GuestLanding />}
      {session.status === "authenticated" && <MemberHome user={session.user} />}
    </>
  );
}
