import { AuthShell } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Sign up · StudyFlow",
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Start turning briefs into clear, evidence-based workflows."
      footer={
        <>
          By signing up you agree to use StudyFlow as a learning coach, not a
          ghostwriter.
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
