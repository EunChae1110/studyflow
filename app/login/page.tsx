import { AuthShell } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign in · StudyFlow",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue your assignment workflow."
      footer={
        <>
          Learning support only — StudyFlow never writes your essay for you.
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
