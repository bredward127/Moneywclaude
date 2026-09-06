import { AuthPageShell } from "@/components/dashboard/AuthPageShell";
import { MfaChallengeForm } from "@/components/dashboard/MfaChallengeForm";

export const metadata = { title: "Verify Your Identity" };

export default async function MfaChallengePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <AuthPageShell
      title="Enter your code"
      description="Open your authenticator app and enter the current 6-digit code."
    >
      <MfaChallengeForm nextPath={next && next.startsWith("/dashboard") ? next : "/dashboard"} />
    </AuthPageShell>
  );
}
