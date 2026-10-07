import Link from "next/link";
import { StudyFlowLockup } from "@/components/brand/studyflow-logo";
import { APP_TAGLINE } from "@/lib/constants";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <Link href="/login" className="mb-8 inline-flex self-center">
          <StudyFlowLockup markClassName="size-9" wordmarkClassName="text-lg" />
        </Link>

        <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-foreground/10 sm:p-8">
          <div className="mb-6 space-y-1 text-center">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
        <p className="mt-3 text-center text-xs text-muted">{APP_TAGLINE}</p>
      </div>
    </div>
  );
}
