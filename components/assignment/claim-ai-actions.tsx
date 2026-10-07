"use client";

import { Button } from "@/components/ui/button";

export function ClaimAiActions({ claim }: { claim: string }) {
  const ask = (prompt: string) => {
    window.dispatchEvent(new CustomEvent("studyflow:open-ai"));
    window.dispatchEvent(
      new CustomEvent("studyflow:ask-ai", { detail: { prompt } }),
    );
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full justify-start"
        onClick={() =>
          ask(
            `Check the logic of this claim and its evidence gaps. Claim: “${claim}”. Do not write the essay.`,
          )
        }
      >
        Check logic
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full justify-start"
        onClick={() =>
          ask(
            `Suggest a fair counterargument to this claim and what evidence would address it. Claim: “${claim}”. Do not write the essay.`,
          )
        }
      >
        Find counterargument
      </Button>
    </>
  );
}
