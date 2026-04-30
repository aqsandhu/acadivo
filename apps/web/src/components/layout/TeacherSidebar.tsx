"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard, BookOpen, ClipboardList, FileText, BarChart3, HelpCircle,
  FileBadge, MessageSquare, Calendar, Bell, GraduationCap, LogOut, Menu, X, Megaphone
} from "lucide-react";
import { useState } from "react";

const teacherLinks = [
  { href: "/teacher", label: "dashboard", icon: LayoutDashboard },
  { href: "/teacher/classes", label: "classes", icon: GraduationCap },
  { href: "/teacher/attendance", label: "attendance", icon: ClipboardList },
  { href: "/teacher/homework", label: "homework", icon: FileText },
  { href: "/teacher/marks", label: "marks", icon: BarChart3 },
  { href: "/teacher/qa", label: "qa", icon: HelpCircle },
  { href: "/teacher/reports", label: "reports", icon: FileBadge },
  { href: "/teacher/messages", label: "messages", icon: MessageSquare },
  { href: "/teacher/timetable", label: "timetable", icon: Calendar },
  { href: "/teacher/notifications", label: "notifications", icon: Bell },
  { href: "/advertisements", label: "advertisements", icon: Megaphone },
];

export function TeacherSidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(!open)} className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-primary-foreground rounded-md">
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r flex flex-col transition-transform lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-primary">Acadivo</h1>
          <p className="text-xs text-muted-foreground">Teacher Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {teacherLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {t(`common.${link.label}`)}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
            <LogOut className="h-4 w-4" />
            {t("common.logout")}
          </Link>
        </div>
      </aside>
    