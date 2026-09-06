import { redirect } from "next/navigation";
import { getStaffSessionState } from "@/lib/dashboard/auth";
import { AuthPageShell } from "@/components/dashboard/AuthPageShell";
import { MfaEnrollForm } from "@/components/dashboard/MfaEnrollForm";

export const metadata = { title: "Set Up Two-Factor Authentication" };

export default async function MfaEnrollPage() {
  const state = await getStaffSessionState();
  if (state.status === "unauthenticated") redirect("/dashboard/login");
  if (state.status === "ok" && !state.profile.passwordSetAt) {
    redirect("/dashboard/onboarding/set-password");
  }

  return (
    <AuthPageShell
      title="Set up two-factor authentication"
      description="Scan this code with your authenticator app (like Google Authenticator or 1Password), then enter the 6-digit code it shows you. This step is required for every account."
    >
      <MfaEnrollForm />
    </AuthPageShell>
  );
}
