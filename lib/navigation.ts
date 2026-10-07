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
  { href: "/research-library", label: "Saved References", icon: Bookmark },
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
