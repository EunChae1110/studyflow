import { sourceKinds } from "@/lib/mock-data";

export function SourceKindLegend() {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold">Source labels</h3>
      <div className="flex flex-wrap gap-2">
        {sourceKinds.map((kind) => (
          <span
            key={kind.label}
            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${kind.color}`}
          >
            {kind.label}
          </span>
        ))}
      </div>
    </div>
  );
}
