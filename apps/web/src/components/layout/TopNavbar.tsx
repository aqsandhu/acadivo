"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Globe,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Laptop,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useNotifications } from "@/hooks/useNotifications";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { SearchBar } from "@/components/ui/SearchBar";

interface TopNavbarProps {
  onMenuToggle: () => void;
  pageTitle?: string;
}

export function TopNavbar({ onMenuToggle, pageTitle }: TopNavbarProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { toggleTheme, resolvedTheme, setTheme } = useTheme();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showSearch, setShowSearch] = React.useState(false);

  const currentLang = i18n.language || "en";
  const isRTL = currentLang === "ur";

  const handleLanguageChange = () => {
    const newLang = currentLang === "en" ? "ur" : "en";
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === "ur" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const userDropdownItems = [
    {
      label: t("common.profile"),
      icon: <User className="h-4 w-4" />,
      onClick: () => router.push("/dashboard/profile"),
    },
    {
      label: t("common.settings"),
      icon: <Settings className="h-4 w-4" />,
      onClick: () => router.push("/dashboard/settings"),
    },
    { separator: true, label: "" },
    {
      label: t("common.logout"),
      icon: <LogOut className="h-4 w-4" />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  const notificationRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md lg:px-6">
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuToggle}
        className="lg:hidden"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page title */}
      {pageTitle && (
        <h1 className="text-lg font-semibold text-foreground hidden md:block">
          {pageTitle}
        </h1>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search (desktop) */}
      <div className="hidden md:block">
        <SearchBar
          value=""
          onChange={(value) => {
            // Global search action
            console.log("Search:", value);
          }}
          placeholder={t("common.search")}
          className="w-64"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Mobile search toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setShowSearch(!showSearch)}
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Language toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLanguageChange}
          className="hidden sm:flex"
          aria-label={isRTL ? "Switch to English" : "اردو میں تبدیل کریں"}
        >
          <Globe className="h-5 w-5" />
          <span className="ml-1 text-xs font-medium hidden xl:inline">
            {isRTL ? "EN" : "UR"}
          </span>
        </Button>

        {/* Theme toggle */}
        <Dropdown
          trigger={
            <Button variant="ghost" size="icon" aria-label="Toggle theme">
              {resolvedTheme === "dark" ? (
                <Moon className="h-5 w-5" />
              ) : resolvedTheme === "light" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Laptop className="h-5 w-5" />
              )}
            </Button>
          }
          items={[
            {
              label: t("common.light"),
              icon: <Sun className="h-4 w-4" />,
              onClick: () => setTheme("light"),
            },
            {
              label: t("common.dark"),
              icon: <Moon className="h-4 w-4" />,
              onClick: () => setTheme("dark"),
            },
            {
              label: t("common.system"),
              icon: <Laptop className="h-4 w-4" />,
              onClick: () => setTheme("system"),
            },
          ]}
        />

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>

          {showNotifications && (
            <div className={cn(
              "absolute right-0 top-full mt-2 w-80 rounded-lg border bg-popover p-0 shadow-lg",
              isRTL && "right-auto left-0"
            )}>
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h3 className="font-semibold text-sm">{t("navigation.notifications")}</h3>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    {t("communication.markAllAsRead")}
                  </Button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                    {t("communication.noNotifications")}
                  </p>
                ) : (
                  notifications.slice(0, 8).map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => {
                        if (notif.actionUrl) router.push(notif.actionUrl);
                        setShowNotifications(false);
                      }}
                      className={cn(
                        "flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-muted/50 last:border-0",
                        !notif.isRead && "bg-primary-50/50 dark:bg-primary-950/20"
                      )}
                    >
                      <div className={cn(
                        "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                        notif.type === "success" && "bg-success-500",
                        notif.type === "error" && "bg-danger-500",
                        notif.type === "warning" && "bg-warning-500",
                        notif.type === "info" && "bg-info-500"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notif.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{notif.body}</p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="border-t px-4 py-2">
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="block text-center text-xs font-medium text-primary-800 hover:underline"
                >
                  {t("common.showMore")}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        {user && (
          <Dropdown
            trigger={
              <Button variant="ghost" className="gap-2 pl-1 pr-2">
                <Avatar src={user.avatar} fallback={user.name} size="sm" />
                <span className="hidden text-sm font-medium lg:inline">{user.name}</span>
                <ChevronDown className="hidden h-4 w-4 lg:inline" />
              </Button>
            }
            items={userDropdownItems}
          />
        )}
      </div>

      {/* Mobile search bar */}
      {showSearch && (
        <div className="absolute left-0 right-0 top-16 border-b bg-background p-3 shadow-md md:hidden">
          <SearchBar
            value=""
            onChange={(value) => console.log("Search:", value)}
            placeholder={t("common.search")}
            autoFocus
          />
        </div>
      )}
    </header>
  );
}
