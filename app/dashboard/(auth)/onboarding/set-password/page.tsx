import { AuthPageShell } from "@/components/dashboard/AuthPageShell";
import { SetPasswordForm } from "@/components/dashboard/SetPasswordForm";

export const metadata = { title: "Set Your Password" };

export default function SetPasswordPage() {
  return (
    <AuthPageShell
      title="Welcome — set your password"
      description="Choose a password for your account. Next, you'll set up two-factor authentication."
    >
      <SetPasswordForm nextPath="/dashboard/onboarding/mfa-enroll" />
    </AuthPageShell>
  );
}
