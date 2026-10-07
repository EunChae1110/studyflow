import { Check } from "lucide-react";
import { workflowSteps } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function WorkflowStepper() {
  return (
    <div className="mb-5 rounded-xl border border-border bg-surface px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        {workflowSteps.map((step, index) => (
          <div key={step.label} className="flex items-center">
            <div className={cn("flex items-center gap-2 text-xs text-muted", step.state === "current" && "text-foreground")}>
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-full border text-[11px] font-semibold",
                  step.state === "done" && "border-emerald-600 bg-emerald-600 text-white",
                  step.state === "current" && "border-primary bg-primary text-primary-foreground",
                  step.state === "pending" && "border-border bg-surface text-muted",
                )}
              >
                {step.state === "done" ? <Check className="size-3.5" /> : index + 1}
              </span>
              <span className="font-medium">{step.label}</span>
            </div>
            {index < workflowSteps.length - 1 ? (
              <span
                className={cn(
                  "mx-2 h-0.5 w-6 rounded",
                  step.state === "done" ? "bg-emerald-500" : "bg-border",
                )}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
