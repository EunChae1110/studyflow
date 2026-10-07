import { cn } from "@/lib/utils";

type MarkProps = {
  className?: string;
  withShadow?: boolean;
};

export function StudyFlowMark({ className, withShadow = false }: MarkProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={cn("size-8", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="2"
        y="2"
        width="96"
        height="96"
        rx="26"
        fill="#5B5CE2"
        className={withShadow ? "drop-shadow-[0_4px_10px_rgba(91,92,226,0.3)]" : ""}
      />
      <path
        d="M70 22C70 28.8 64.6 33 57.8 33H47.5C39.8 33 34 37.6 34 44C34 50.4 39.8 55 47.5 55H55.5C63.2 55 69 59.6 69 66C69 72.4 63.2 77 55.5 77H47C40.8 77 36 80.2 35.2 85"
        stroke="white"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StudyFlowWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-end gap-0.5 text-base font-semibold tracking-[-0.02em]", className)}>
      <span className="text-foreground">Study</span>
      <span className="relative text-foreground">
        Flow
        <span className="absolute -right-0.5 -bottom-0.5 left-0 h-px bg-primary/65" />
      </span>
    </span>
  );
}

export function StudyFlowLockup({
  className,
  markClassName,
  wordmarkClassName,
}: {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <StudyFlowMark className={markClassName} withShadow />
      <StudyFlowWordmark className={wordmarkClassName} />
    </div>
  );
}
