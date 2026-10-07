import {
  BookOpen,
  Bookmark,
  Calendar,
  FileText,
  HelpCircle,
  Home,
  LibraryBig,
  Settings,
} from "lucide-react";

export const workspaceNav = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/assignments", label: "Assignments", icon: FileText },
  { href: "/calendar", label: "Calendar", icon: Calendar },
];

/** Static fallback when courses have not loaded yet — prefer DB courses in shell. */
export const courseNav = [
  { href: "/courses", label: "Courses", icon: BookOpen },
];

export const toolNav = [
  { href: "/research-library", label: "Research Library", icon: LibraryBig },
  { href: "/research-library?tab=saved", label: "Saved References", icon: Bookmark },
];

export const bottomNav = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/assignments", label: "Assignments", icon: FileText },
  { href: "/research-library", label: "Research", icon: LibraryBig },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/courses", label: "More", icon: BookOpen },
];

export const supportNav = [
  { href: "/dashboard", label: "Settings", icon: Settings },
  { href: "/dashboard", label: "Help Centre", icon: HelpCircle },
];

/** Exact path match, or nested path under href (e.g. /assignments/[id]). */
export function isPathActive(pathname: string, href: string): boolean {
  const pathOnly = href.split("?")[0] ?? href;
  if (pathname === pathOnly) return true;
  return pathname.startsWith(`${pathOnly}/`);
}

/**
 * Tools / query-aware active check.
 * - href without query → active only when pathname matches and the related tab is not set
 * - href with ?tab=x → active when pathname matches and tab equals x
 */
export function isToolActive(
  pathname: string,
  searchParams: URLSearchParams | { get: (key: string) => string | null },
  href: string,
): boolean {
  const [pathOnly, query = ""] = href.split("?");
  if (pathname !== pathOnly) return false;

  const expected = new URLSearchParams(query);
  const expectedTab = expected.get("tab");
  const currentTab = searchParams.get("tab");

  if (expectedTab) {
    return currentTab === expectedTab;
  }
  // Default research library entry: not active when a specific tab is selected.
  return !currentTab;
}
