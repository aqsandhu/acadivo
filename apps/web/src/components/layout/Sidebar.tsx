"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  MessageSquare,
  Bell,
  Megaphone,
  Settings,
  DollarSign,
  FileBarChart,
  ChevronRight,
  ChevronDown,
  X,
  School,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  children?: NavItem[];
  roles?: string[];
}

const getNavigationItems = (t: (key: string) => string): NavItem[] => [
  {
    label: t("navigation.dashboard"),
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: t("navigation.academic"),
    href: "#",
    icon: <GraduationCap className="h-5 w-5" />,
    children: [
      { label: t("navigation.attendance"), href: "/dashboard/attendance", icon: <Calendar className="h-4 w-4" /> },
      { label: t("navigation.homework"), href: "/dashboard/homework", icon: <BookOpen className="h-4 w-4" /> },
      { label: t("navigation.marks"), href: "/dashboard/marks", icon: <FileBarChart className="h-4 w-4" /> },
      { label: t("navigation.results"), href: "/dashboard/results", icon: <GraduationCap className="h-4 w-4" /> },
      { label: t("navigation.timetable"), href: "/dashboard/timetable", icon: <Calendar className="h-4 w-4" /> },
    ],
  },
  {
    label: t("navigation.communication"),
    href: "#",
    icon: <MessageSquare className="h-5 w-5" />,
    children: [
      { label: t("navigation.messages"), href: "/dashboard/messages", icon: <MessageSquare className="h-4 w-4" /> },
      { label: t("navigation.notifications"), href: "/dashboard/notifications", icon: <Bell className="h-4 w-4" />, badge: 3 },
      { label: t("navigation.announcements"), href: "/dashboard/announcements", icon: <Megaphone className="h-4 w-4" /> },
    ],
  },
  {
    label: t("navigation.administration"),
    href: "#",
    icon: <Users className="h-5 w-5" />,
    roles: ["superAdmin", "principal", "admin"],
    children: [
      { label: t("navigation.students"), href: "/dashboard/students", icon: <GraduationCap className="h-4 w-4" /> },
      { label: t("navigation.teachers"), href: "/dashboard/teachers", icon: <Users className="h-4 w-4" /> },
      { label: t("navigation.parents"), href: "/dashboard/parents", icon: <Users className="h-4 w-4" /> },
      { label: t("navigation.classes"), href: "/dashboard/classes", icon: <School className="h-4 w-4" /> },
      { label: t("navigation.subjects"), href: "/dashboard/subjects", icon: <BookOpen className="h-4 w-4" /> },
    ],
  },
  {
    label: t("navigation.fee"),
    href: "/dashboard/fee",
    icon: <DollarSign className="h-5 w-5" />,
    roles: ["superAdmin", "principal", "admin"],
  },
  {
    label: t("navigation.reports"),
    href: "/dashboard/reports",
    icon: <FileBarChart className="h-5 w-5" />,
  },
  {
    label: t("navigation.settings"),
    href: "/dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed?: boolean;
}

export function Sidebar({ isOpen, onClose, collapsed = false }: SidebarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { user } = useAuth();
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set());

  const navItems = getNavigationItems(t);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const isActive = (href: string) => {
    if (href === "#") return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return user?.role ? item.roles.includes(user.role) : false;
  });

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300 ease-in-out lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "w-[70px]" : "w-[260px]"
        )}
      >
        {/* Logo area */}
        <div className="flex h-16 items-center gap-3 border-b px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-800">
            <School className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-tight text-primary-800 dark:text-primary-400">
                {t("common.appName")}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                {t("common.appTagline")}
              </span>
            </div>
          )}
          <button
            onClick={onClose}
            className="ml-auto lg:hidden rounded-md p-1 hover:bg-muted"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedGroups.has(item.label);
              const active = isActive(item.href) || item.children?.some((c) => isActive(c.href));

              return (
                <li key={item.label}>
                  {hasChildren ? (
                    <>
                      <button
                        onClick={() => toggleGroup(item.label)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary-50 text-primary-800 dark:bg-primary-950 dark:text-primary-300"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <span className="shrink-0">{item.icon}</span>
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left">{item.label}</span>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 shrink-0" />
                            ) : (
                              <ChevronRight className="h-4 w-4 shrink-0" />
                            )}
                          </>
                        )}
                      </button>
                      {isExpanded && !collapsed && (
                        <ul className="ml-4 mt-1 space-y-1 border-l pl-3">
                          {item.children?.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                onClick={onClose}
                                className={cn(
                                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                                  isActive(child.href)
                                    ? "bg-primary-50 font-medium text-primary-800 dark:bg-primary-950 dark:text-primary-300"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                              >
                                <span className="shrink-0">{child.icon}</span>
                                <span>{child.label}</span>
                                {child.badge ? (
                                  <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary-800 px-1.5 text-[10px] font-bold text-white">
                                    {child.badge}
                                  </span>
                                ) : null}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary-50 text-primary-800 dark:bg-primary-950 dark:text-primary-300"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.label}</span>
                          {item.badge ? (
                            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary-800 px-1.5 text-[10px] font-bold text-white">
                              {item.badge}
                            </span>
                          ) : null}
                        </>
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User card */}
        {!collapsed && user && (
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <Avatar
                src={user.avatar}
                fallback={user.name}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground capitalize">
                  {t(`roles.${user.role}`)}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
