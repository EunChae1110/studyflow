import Link from "next/link";
import {
  BookOpenCheck,
  ClipboardList,
  GitBranch,
  Library,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { StudyFlowLockup, StudyFlowMark } from "@/components/brand/studyflow-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: BookOpenCheck,
    title: "Notes that stay grounded",
    body: "Ask about your lecture notes with page-aware answers — no floating claims.",
  },
  {
    icon: Library,
    title: "Research with provenance",
    body: "Collect sources, mark what you verified, and keep open-access vs paywalled clear.",
  },
  {
    icon: ClipboardList,
    title: "Claim ↔ evidence map",
    body: "Link every claim to quotes or paraphrases so your argument stays honest.",
  },
  {
    icon: GitBranch,
    title: "Outline coach",
    body: "Shape structure and paragraph purpose. You still write the essay yourself.",
  },
];

const steps = [
  { n: "01", title: "Understand the brief", desc: "Checklist, rubric, due date — one clear next action." },
  { n: "02", title: "Gather & verify", desc: "Notes + research with student-verified evidence tags." },
  { n: "03", title: "Plan, then draft", desc: "Outline coaching only — never auto-generate essays." },
];

type LandingPageProps = {
  authenticated: boolean;
};

export function LandingPage({ authenticated }: LandingPageProps) {
  const primaryHref = authenticated ? "/dashboard" : "/signup";
  const primaryLabel = authenticated ? "Open dashboard" : "Get started free";
  const secondaryHref = authenticated ? "/assignments" : "/login";
  const secondaryLabel = authenticated ? "My assignments" : "Log in";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="inline-flex">
            <StudyFlowLockup markClassName="size-8" wordmarkClassName="text-[17px]" />
          </Link>
          <nav className="ml-auto hidden items-center gap-1 sm:flex">
            <a
              href="#features"
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-surface-muted hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#how"
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-surface-muted hover:text-foreground"
            >
              How it works
            </a>
          </nav>
          <ThemeToggle />
          {!authenticated ? (
            <>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
              >
                Log in
              </Link>
              <Link href="/signup" className={cn(buttonVariants({ size: "sm" }))}>
                Sign up
              </Link>
            </>
          ) : (
            <Link href="/dashboard" className={cn(buttonVariants({ size: "sm" }))}>
              Dashboard
            </Link>
          )}
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(91,92,226,0.14),_transparent_55%)]"
          />
          <div className="relative mx-auto grid max-w-5xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12 lg:py-24">
            <div className="space-y-6">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="size-3.5" />
                Learning productivity · 唔代寫 essay
              </p>
              <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                Turn every assignment into a{" "}
                <span className="text-primary">clear, evidence-based</span> workflow.
              </h1>
              <p className="max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
                StudyFlow 係學習教練，唔係代寫工具。由 brief → notes → research →
                claim–evidence → outline，幫你組織證據同結構——正文仍然由你寫。
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link href={primaryHref} className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}>
                  {primaryLabel}
                </Link>
                <Link
                  href={secondaryHref}
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-5")}
                >
                  {secondaryLabel}
                </Link>
              </div>
              <p className="flex items-center gap-2 text-xs text-muted">
                <ShieldCheck className="size-3.5 text-[var(--success)]" />
                Transparent provenance · student-verified evidence · no ghostwriting
              </p>
            </div>

            <div className="relative">
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-[0_20px_50px_-24px_rgba(91,92,226,0.45)] ring-1 ring-foreground/5">
                <div className="mb-4 flex items-center gap-2">
                  <StudyFlowMark className="size-7" withShadow />
                  <div>
                    <p className="text-sm font-medium">Assignment coach</p>
                    <p className="text-xs text-muted">Notes-only · Research · Outline</p>
                  </div>
                </div>
                <div className="space-y-2.5 text-sm">
                  <div className="rounded-xl bg-primary-soft/70 px-3.5 py-2.5 text-foreground">
                    How does 3NF reduce update anomalies in my lecture notes?
                  </div>
                  <div className="rounded-xl border border-border bg-surface-muted px-3.5 py-2.5 text-muted-foreground">
                    From <span className="font-medium text-foreground">Lecture 04 p.12</span>:
                    splitting non-key dependencies removes multi-row updates…{" "}
                    <span className="text-primary">→ verify in source</span>
                  </div>
                  <div className="rounded-xl border border-dashed border-border px-3.5 py-2.5 text-xs text-muted">
                    Next: map this to a claim ↔ evidence card, then outline paragraph purpose.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-border bg-surface/60 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mb-10 max-w-2xl space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Built for the whole assignment loop
              </h2>
              <p className="text-sm text-muted-foreground sm:text-base">
                每個步驟都有對應嘅 AI mode——永遠 grounded 喺你嘅 notes、sources 同 checklist。
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {features.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-border bg-background p-5 ring-1 ring-foreground/5"
                >
                  <div className="mb-3 grid size-9 place-items-center rounded-lg bg-primary-soft text-primary">
                    <Icon className="size-4.5" />
                  </div>
                  <h3 className="text-base font-medium">{title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mb-10 max-w-2xl space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">How StudyFlow helps</h2>
              <p className="text-sm text-muted-foreground sm:text-base">
                三步走完：理解題目 → 收集同核實證據 → 規劃結構。Draft 頁只俾回饋，唔代你出正文。
              </p>
            </div>
            <ol className="grid gap-3 md:grid-cols-3">
              {steps.map((step) => (
                <li
                  key={step.n}
                  className="rounded-2xl border border-border bg-surface p-5 ring-1 ring-foreground/5"
                >
                  <p className="text-xs font-semibold tracking-wide text-primary">{step.n}</p>
                  <h3 className="mt-2 text-base font-medium">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{step.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-t border-border bg-[linear-gradient(180deg,rgba(91,92,226,0.08),transparent)] py-16">
          <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="max-w-xl space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">Ready to organise your next brief?</h2>
              <p className="text-sm text-muted-foreground">
                免費開帳戶，即刻用 Notes / Research / Outline coach。學習支援 only。
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={primaryHref} className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}>
                {primaryLabel}
              </Link>
              {!authenticated ? (
                <Link
                  href="/login"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-5")}
                >
                  Log in
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="inline-flex items-center gap-2">
            <StudyFlowMark className="size-6" />
            <span>StudyFlow</span>
          </div>
          <p>Learning support only · Never writes your essay for you</p>
        </div>
      </footer>
    </div>
  );
}
