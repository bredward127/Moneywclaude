import { AuthPageShell } from "@/components/dashboard/AuthPageShell";
import { SetPasswordForm } from "@/components/dashboard/SetPasswordForm";

export const metadata = { title: "Set a New Password" };

export default function ResetPasswordConfirmPage() {
  return (
    <AuthPageShell title="Set a new password" description="Choose a new password for your account.">
      <SetPasswordForm nextPath="/dashboard" />
    </AuthPageShell>
  );
}
