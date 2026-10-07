import type { ReactNode } from "react";
import Link from "next/link";
import { StudyFlowLockup, StudyFlowMark } from "@/components/brand/studyflow-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LandingAppPreview } from "@/components/marketing/landing-app-preview";
import {
  ClaimVignette,
  NotesVignette,
  ResearchVignette,
} from "@/components/marketing/landing-vignettes";
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
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 pt-16 pb-10 sm:px-6 sm:pt-24 sm:pb-14">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-balance text-[2.35rem] font-semibold leading-[1.12] tracking-[-0.035em] sm:text-5xl sm:leading-[1.08]">
                Assignment workspace for university students
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                Brief, notes, research, and claim–evidence in one place. Structure first — you
                write the essay.
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

            <div id="product" className="mx-auto mt-14 max-w-5xl scroll-mt-20 sm:mt-16">
              <LandingAppPreview />
            </div>
          </div>
        </section>

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
