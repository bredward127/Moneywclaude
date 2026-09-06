import { AuthPageShell } from "@/components/dashboard/AuthPageShell";
import { ResetPasswordRequestForm } from "@/components/dashboard/ResetPasswordRequestForm";

export const metadata = { title: "Reset Your Password" };

export default function ResetPasswordRequestPage() {
  return (
    <AuthPageShell
      title="Reset your password"
      description="Enter your email and we'll send you a link to set a new password."
    >
      <ResetPasswordRequestForm />
    </AuthPageShell>
  );
}
