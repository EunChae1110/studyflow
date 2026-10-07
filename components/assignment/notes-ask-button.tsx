"use client";

import { Button } from "@/components/ui/button";

export function NotesAskButton({
  icon: Icon,
  label,
  prompt,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  prompt: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-xs"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("studyflow:open-ai"));
        window.dispatchEvent(
          new CustomEvent("studyflow:ask-ai", { detail: { prompt } }),
        );
      }}
    >
      <Icon className="size-3.5" />
      {label}
    </Button>
  );
}
