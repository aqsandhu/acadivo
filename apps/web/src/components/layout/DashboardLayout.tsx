"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  School,
  CreditCard,
  BarChart3,
  Users,
  Megaphone,
  Settings,
  GraduationCap,
  MessageSquare,
  Bell,
  ClipboardList,
  Wallet,
  FileText,
  BookOpen,
  CalendarClock,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DarkModeToggle } from "./DarkModeToggle";

type Role = "super-admin" | "principal" | "admin";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_CONFIG: Record<Role, NavItem[]> = {
  "super-admin": [
    { label: "nav.dashboard", href: "/super-admin", icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: "nav.schools", href: "/super-admin/schools", icon: <School className="h-5 w-5" /> },
    { label: "nav.subscriptions", href: "/super-admin/subscriptions", icon: <CreditCard className="h-5 w-5" /> },
    { label: "nav.analytics", href: "/super-admin/analytics", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "nav.users", href: "/super-admin/users", icon: <Users className="h-5 w-5" /> },
    { label: "nav.advertisements", href: "/super-admin/advertisements", icon: <Megaphone className="h-5 w-5" /> },
    { label: "nav.announcements", href: "/super-admin/announcements", icon: <Bell className="h-5 w-5" /> },
    { label: "nav.settings", href: "/super-admin/settings", icon: <Settings className="h-5 w-5" /> },
  ],
  principal: [
    { label: "nav.dashboard", href: "/principal", icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: "nav.teachers", href: "/principal/teachers", icon: <GraduationCap className="h-5 w-5" /> },
    { label: "nav.students", href: "/principal/students", icon: <Users className="h-5 w-5" /> },
    { label: "nav.parents", href: "/principal/parents", icon: <UserCircle className="h-5 w-5" /> },
    { label: "nav.announcements", href: "/principal/announcements", icon: <Bell className="h-5 w-5" /> },
    { label: "nav.messages", href: "/principal/messages", icon: <MessageSquare className="h-5 w-5" /> },
    { label: "nav.notifications", href: "/principal/notifications", icon: <Megaphone className="h-5 w-5" /> },
    { label: "nav.attendance", href: "/principal/attendance", icon: <ClipboardList className="h-5 w-5" /> },
    { label: "nav.fee", href: "/principal/fee", icon: <Wallet className="h-5 w-5" /> },
    { label: "nav.reports", href: "/principal/reports", icon: <FileText className="h-5 w-5" /> },
  ],
  admin: [
    { label: "nav.dashboard", href: "/admin", icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: "nav.teachers", href: "/admin/teachers", icon: <GraduationCap className="h-5 w-5" /> },
    { label: "nav.students", href: "/admin/students", icon: <Users className="h-5 w-5" /> },
    { label: "nav.parents", href: "/admin/parents", icon: <UserCircle className="h-5 w-5" /> },
    { label: "nav.classes", href: "/admin/classes", icon: <School className="h-5 w-5" /> },
    { label: "nav.subjects", href: "/admin/subjects", icon: <BookOpen className="h-5 w-5" /> },
    { label: "nav.timetable", href: "/admin/timetable", icon: <CalendarClock className="h-5 w-5" /> },
    { label: "nav.attendance", href: "/admin/attendance", icon: <ClipboardList className="h-5 w-5" /> },
    { label: "nav.fee", href: "/admin/fee", icon: <Wallet className="h-5 w-5" /> },
    { label: "nav.announcements", href: "/admin/announcements", icon: <Bell className="h-5 w-5" /> },
    { label: "nav.settings", href: "/admin/settings", icon: <Settings className="h-5 w-5" /> },
  ],
};

function detectRoleFromPath(pathname: string): Role {
  if (pathname.startsWith("/super-admin")) return "super-admin";
  if (pathname.startsWith("/principal")) return "principal";
  return "admin";
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const role = detectRoleFromPath(pathname || "");
  const navItems = NAV_CONFIG[role];
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r bg-card transition-all duration-300 lg:static",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight">{t("app.name")}</span>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded-md p-1 hover:bg-muted lg:block"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.icon}
                {!collapsed && <span>{t(item.label)}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
              {role === "super-admin" ? "SA" : role === "principal" ? "PR" : "AD"}
            </div>
            {!collapsed && (
              <div className="text-sm">
                <div className="font-medium">
                  {role === "super-admin" ? "Super Admin" : role === "principal" ? "Principal" : "School Admin"}
                </div>
                <div className="text-xs text-muted-foreground">{role}@acadivo.pk</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 hover:bg-muted lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold capitalize">
            {t(navItems.find((n) => pathname?.startsWith(n.href))?.label || "nav.dashboard")}
          </h1>
          <div className="flex-1" />
          <DarkModeToggle />
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
