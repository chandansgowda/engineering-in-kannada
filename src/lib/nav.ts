import { BookOpen, FileText, GraduationCap, Link2, Trophy } from "lucide-react";

export const NAV = [
  { to: "/", label: "Courses", icon: BookOpen, match: (p: string) => p === "/" || p === "/courses" || p.startsWith("/course/") },
  { to: "/learning", label: "My Learning", icon: GraduationCap, match: (p: string) => p === "/learning" },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy, match: (p: string) => p === "/leaderboard" },
  { to: "/blogs", label: "Blogs", icon: FileText, match: (p: string) => p.startsWith("/blogs") },
  { to: "/links", label: "Links", icon: Link2, match: (p: string) => p === "/links" },
];
