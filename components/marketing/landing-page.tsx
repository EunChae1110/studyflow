import type { ReactNode } from "react";
import Link from "next/link";
import { StudyFlowLockup, StudyFlowMark } from "@/components/brand/studyflow-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LandingPageProps = {
  authenticated: boolean;
};

export function LandingPage({ authenticated }: LandingPageProps) {
  const primaryHref = authenticated ? "/dashboard" : "/signup";
  const primaryLabel = authenticated ? "Open dashboard" : "Get started";
  const secondaryHref = authenticated ? "/assignments" : "/login";
  const secondaryLabel = authenticated ? "My assignments" : "Log in";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav — Linear-slim */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-12 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link href="/" className="inline-flex shrink-0">
            <StudyFlowLockup markClassName="size-7" wordmarkClassName="text-[15px]" />
          </Link>
          <nav className="hidden items-center gap-5 text-[13px] text-muted-foreground sm:flex">
            <a href="#product" className="transition-colors hover:text-foreground">
              Product
            </a>
            <a href="#workflow" className="transition-colors hover:text-foreground">
              Workflow
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            {!authenticated ? (
              <>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "hidden h-8 px-2.5 text-[13px] sm:inline-flex",
                  )}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className={cn(buttonVariants({ size: "sm" }), "h-8 px-3 text-[13px]")}
                >
                  Sign up
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ size: "sm" }), "h-8 px-3 text-[13px]")}
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 pt-16 pb-10 sm:px-6 sm:pt-24 sm:pb-14">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-balance text-[2.35rem] font-semibold leading-[1.12] tracking-[-0.035em] sm:text-5xl sm:leading-[1.08]">
                Assignment workspace for university students
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                Brief, notes, research, and claim–evidence in one place.
                Structure first — you write the essay.
              </p>
              <p className="mt-2 text-[13px] text-muted">
                題目 → 筆記 → 來源 → 論點證據，一步步組織。
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
                <Link
                  href={primaryHref}
                  className={cn(buttonVariants({ size: "default" }), "h-9 px-4 text-[13px]")}
                >
                  {primaryLabel}
                </Link>
                <Link
                  href={secondaryHref}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "default" }),
                    "h-9 px-4 text-[13px]",
                  )}
                >
                  {secondaryLabel}
                </Link>
              </div>
            </div>

            {/* Product frame */}
            <div id="product" className="mx-auto mt-14 max-w-5xl scroll-mt-20 sm:mt-16">
              <HeroProductFrame />
            </div>
          </div>
        </section>

        {/* Purpose sections — Fig labels + UI vignettes */}
        <section id="workflow" className="scroll-mt-16">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <div className="mb-14 max-w-xl sm:mb-16">
              <p className="text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
                Workflow
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                Built around how assignments actually get done
              </h2>
            </div>

            <div className="space-y-20 sm:space-y-28">
              <PurposeBlock
                fig="Fig 0.1"
                title="Notes that stay with the source"
                body="Ask against your lecture notes and materials. Answers cite pages — not invent them."
                reverse={false}
                vignette={<NotesVignette />}
              />
              <PurposeBlock
                fig="Fig 0.2"
                title="Research with a clear trail"
                body="Save sources, mark what you verified, and keep open-access vs paywalled visible."
                reverse
                vignette={<ResearchVignette />}
              />
              <PurposeBlock
                fig="Fig 0.3"
                title="Claims mapped to evidence"
                body="Every claim links to a quote or paraphrase. Gaps show up before you draft."
                reverse={false}
                vignette={<ClaimVignette />}
              />
            </div>
          </div>
        </section>

        {/* Quiet guardrail */}
        <section className="border-y border-border bg-surface-muted/40">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-10 sm:flex-row sm:items-baseline sm:justify-between sm:px-6 sm:py-12">
            <p className="text-[15px] font-medium tracking-tight text-foreground">
              StudyFlow does not write your essay.
            </p>
            <p className="text-[13px] text-muted-foreground">
              Outline and feedback only — the draft stays yours.
            </p>
          </div>
        </section>

        {/* Closing CTA — minimal */}
        <section className="border-b border-border">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-5 px-4 py-16 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-20">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.025em] sm:text-2xl">
                Start with your next brief
              </h2>
              <p className="mt-1.5 text-[13px] text-muted-foreground">
                Free account. Notes, research, and outline in one workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href={primaryHref}
                className={cn(buttonVariants({ size: "default" }), "h-9 px-4 text-[13px]")}
              >
                {primaryLabel}
              </Link>
              {!authenticated ? (
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "default" }),
                    "h-9 px-4 text-[13px]",
                  )}
                >
                  Log in
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 text-[12px] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="inline-flex items-center gap-2">
            <StudyFlowMark className="size-5" />
            <span className="text-foreground/80">StudyFlow</span>
          </div>
          <p>Learning support · No essay generation</p>
        </div>
      </footer>
    </div>
  );
}

/* ——— Section layout ——— */

function PurposeBlock({
  fig,
  title,
  body,
  reverse,
  vignette,
}: {
  fig: string;
  title: string;
  body: string;
  reverse: boolean;
  vignette: ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid items-center gap-8 lg:grid-cols-2 lg:gap-14",
        reverse && "lg:[&>*:first-child]:order-2",
      )}
    >
      <div className="max-w-md">
        <p className="font-mono text-[11px] tracking-wide text-muted">{fig}</p>
        <h3 className="mt-2 text-xl font-semibold tracking-[-0.025em] sm:text-[1.35rem]">
          {title}
        </h3>
        <p className="mt-2.5 text-[14px] leading-relaxed text-muted-foreground">{body}</p>
      </div>
      <div className="min-w-0">{vignette}</div>
    </div>
  );
}

/* ——— Hero product shell ——— */

function HeroProductFrame() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_0_rgba(0,0,0,0.04),0_12px_40px_-16px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.03] dark:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.5)] dark:ring-white/[0.04]">
      {/* Window chrome */}
      <div className="flex h-9 items-center gap-2 border-b border-border bg-surface-muted/60 px-3">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
        </div>
        <div className="ml-2 flex h-5 flex-1 items-center rounded-md border border-border/80 bg-background px-2.5">
          <span className="truncate text-[10px] text-muted">
            studyflow.app / assignments / db-normalization
          </span>
        </div>
      </div>

      <div className="flex min-h-[320px] sm:min-h-[380px]">
        {/* Sidebar */}
        <aside className="hidden w-[168px] shrink-0 border-r border-border bg-surface p-3 sm:block">
          <div className="mb-4 flex items-center gap-2 px-1">
            <StudyFlowMark className="size-5" />
            <span className="text-[12px] font-semibold tracking-tight">StudyFlow</span>
          </div>
          <nav className="space-y-0.5 text-[12px]">
            <SideItem active label="Dashboard" />
            <SideItem label="Assignments" />
            <SideItem label="Library" />
            <SideItem label="Calendar" />
          </nav>
          <div className="mt-6 px-1">
            <p className="mb-1.5 text-[10px] font-medium tracking-wide text-muted uppercase">
              Active
            </p>
            <div className="rounded-md border border-border bg-background px-2 py-1.5">
              <p className="truncate text-[11px] font-medium">DB Normalization</p>
              <p className="text-[10px] text-muted">Due Fri · Brief</p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <div className="flex h-10 items-center gap-2 border-b border-border px-3 sm:px-4">
            <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted">
              <span>Assignments</span>
              <span className="text-border">/</span>
              <span className="truncate font-medium text-foreground">DB Normalization Essay</span>
            </div>
            <div className="ml-auto hidden items-center gap-1 sm:flex">
              {["Brief", "Notes", "Research", "Outline"].map((tab, i) => (
                <span
                  key={tab}
                  className={cn(
                    "rounded px-2 py-0.5 text-[11px]",
                    i === 0
                      ? "bg-primary-soft font-medium text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {tab}
                </span>
              ))}
            </div>
          </div>

          <div className="grid flex-1 lg:grid-cols-[1fr_220px]">
            {/* Brief panel */}
            <div className="space-y-4 p-4 sm:p-5">
              <div>
                <p className="text-[10px] font-medium tracking-wide text-muted uppercase">
                  Brief
                </p>
                <h3 className="mt-1 text-[14px] font-semibold tracking-tight sm:text-[15px]">
                  Explain how 3NF reduces update anomalies
                </h3>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  1,500 words · APA · Due Fri 17 Oct
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] font-medium tracking-wide text-muted uppercase">
                  Checklist
                </p>
                {[
                  { done: true, label: "Read lecture 04 + tutorial notes" },
                  { done: true, label: "Define anomaly types with examples" },
                  { done: false, label: "Link each claim to a source quote" },
                  { done: false, label: "Draft outline paragraph purposes" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-2 rounded-md border border-border/80 bg-background px-2.5 py-1.5"
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-3.5 shrink-0 place-items-center rounded border text-[8px]",
                        item.done
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-surface",
                      )}
                    >
                      {item.done ? "✓" : ""}
                    </span>
                    <span
                      className={cn(
                        "text-[12px] leading-snug",
                        item.done ? "text-muted-foreground line-through" : "text-foreground",
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="rounded-md border border-dashed border-border bg-surface-muted/50 px-3 py-2.5">
                <p className="text-[10px] font-medium text-muted">Next action</p>
                <p className="mt-0.5 text-[12px] text-foreground">
                  Map update-anomaly claim → Lecture 04 p.12 quote
                </p>
              </div>
            </div>

            {/* Side coach panel */}
            <div className="hidden border-l border-border bg-surface-muted/30 p-3 lg:block">
              <p className="mb-2 text-[10px] font-medium tracking-wide text-muted uppercase">
                Coach
              </p>
              <div className="space-y-2 text-[11px] leading-relaxed">
                <div className="rounded-md border border-border bg-background px-2.5 py-2 text-muted-foreground">
                  What does the rubric expect for &ldquo;evidence quality&rdquo;?
                </div>
                <div className="rounded-md border border-border bg-background px-2.5 py-2">
                  Rubric asks for primary lecture citations plus one peer-reviewed source per
                  major claim. Flag anything still unverified.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SideItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-md px-2 py-1.5",
        active ? "bg-primary-soft font-medium text-primary" : "text-muted-foreground",
      )}
    >
      {label}
    </div>
  );
}

/* ——— Section vignettes ——— */

function NotesVignette() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm ring-1 ring-black/[0.02] dark:ring-white/[0.03]">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-[11px] font-medium">Lecture 04 · Normalization</span>
        <span className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[10px] text-muted">
          p.12
        </span>
      </div>
      <div className="grid sm:grid-cols-2">
        <div className="space-y-2 border-b border-border p-3 text-[11px] leading-relaxed text-muted-foreground sm:border-r sm:border-b-0">
          <p>
            A relation is in 3NF if it is in 2NF and no non-prime attribute is transitively
            dependent on a candidate key…
          </p>
          <p className="text-muted">…splitting removes multi-row update paths.</p>
        </div>
        <div className="space-y-2 bg-surface-muted/40 p-3">
          <p className="text-[10px] font-medium tracking-wide text-muted uppercase">Ask</p>
          <div className="rounded-md border border-border bg-background px-2.5 py-2 text-[11px]">
            How does 3NF reduce update anomalies here?
          </div>
          <div className="rounded-md border border-border bg-background px-2.5 py-2 text-[11px] text-muted-foreground">
            From <span className="font-medium text-foreground">p.12</span>: transitive
            dependencies force the same fact into many rows — splitting isolates it.
          </div>
        </div>
      </div>
    </div>
  );
}

function ResearchVignette() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm ring-1 ring-black/[0.02] dark:ring-white/[0.03]">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-[11px] font-medium">Sources</span>
        <span className="text-[10px] text-muted">3 saved · 1 needs verify</span>
      </div>
      <ul className="divide-y divide-border text-[12px]">
        {[
          {
            title: "Codd — Further Normalization…",
            meta: "ACM · 1971",
            badge: "Verified",
            badgeTone: "ok" as const,
          },
          {
            title: "Lecture 04 slides",
            meta: "Course material · PDF",
            badge: "Open",
            badgeTone: "neutral" as const,
          },
          {
            title: "Date — Database Design…",
            meta: "Addison-Wesley · ch.11",
            badge: "Verify",
            badgeTone: "warn" as const,
          },
        ].map((row) => (
          <li key={row.title} className="flex items-center gap-3 px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{row.title}</p>
              <p className="text-[10px] text-muted">{row.meta}</p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
                row.badgeTone === "ok" && "bg-primary-soft text-primary",
                row.badgeTone === "warn" && "bg-surface-muted text-muted-foreground",
                row.badgeTone === "neutral" && "bg-surface-muted text-muted-foreground",
              )}
            >
              {row.badge}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ClaimVignette() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm ring-1 ring-black/[0.02] dark:ring-white/[0.03]">
      <div className="border-b border-border px-3 py-2">
        <span className="text-[11px] font-medium">Claim ↔ evidence</span>
      </div>
      <div className="space-y-2 p-3">
        <div className="rounded-md border border-border bg-background p-2.5">
          <p className="text-[10px] font-medium tracking-wide text-muted uppercase">Claim</p>
          <p className="mt-1 text-[12px] leading-snug">
            3NF eliminates update anomalies caused by transitive dependencies.
          </p>
        </div>
        <div className="flex items-center justify-center">
          <div className="h-4 w-px bg-border" />
        </div>
        <div className="rounded-md border border-border border-l-2 border-l-primary bg-background p-2.5">
          <p className="text-[10px] font-medium tracking-wide text-muted uppercase">
            Evidence · Lecture 04 p.12
          </p>
          <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
            &ldquo;…non-key attributes determined by other non-key attributes create redundant
            update sites.&rdquo;
          </p>
        </div>
        <p className="pt-1 text-[10px] text-muted">1 claim linked · 0 gaps on this card</p>
      </div>
    </div>
  );
}
