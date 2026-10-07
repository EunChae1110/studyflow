"use client";

import {
  BookOpen,
  HelpCircle,
  Lightbulb,
  Search,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ICONS: Record<string, LucideIcon> = {
  lightbulb: Lightbulb,
  search: Search,
  "help-circle": HelpCircle,
  "book-open": BookOpen,
};

export function NotesAskButton({
  icon,
  label,
  prompt,
}: {
  icon: keyof typeof ICONS;
  label: string;
  prompt: string;
}) {
  const Icon = ICONS[icon];

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
      {Icon ? <Icon className="size-3.5" /> : null}
      {label}
    </Button>
  );
}
