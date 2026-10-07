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
  { href: "/assignments", label: "Assignments", icon: FileText, count: 3 },
  { href: "/calendar", label: "Calendar", icon: Calendar },
];

export const courseNav = [
  { href: "/courses", label: "Database Systems", icon: BookOpen },
  { href: "/courses", label: "Academic English", icon: BookOpen },
  { href: "/courses", label: "Economics", icon: BookOpen },
];

export const toolNav = [
  { href: "/research-library", label: "Research Library", icon: LibraryBig },
  { href: "/assignments/database-normalisation-report/references", label: "Saved References", icon: Bookmark },
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
