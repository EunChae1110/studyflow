"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // next-themes injects an inline <script> to prevent theme FOUC.
  // React 19 warns about executable <script> tags rendered in client components.
  // Keep a real script on SSR (FOUC prevention); mark it non-JS on the client
  // so React skips the warning. See: pacocoursey/next-themes#385 / #387
  const scriptProps =
    typeof window === "undefined"
      ? undefined
      : ({ type: "application/json" } as const);

  return (
    <NextThemesProvider {...props} scriptProps={scriptProps}>
      {children}
    </NextThemesProvider>
  );
}
