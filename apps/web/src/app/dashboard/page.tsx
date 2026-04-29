"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Users,
  GraduationCap,
  School,
  TrendingUp,
  DollarSign,
  BookOpen,
  Bell,
  Calendar,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import type { DashboardStats } from "@/types";

function StatCard({
  title,
  value,
  icon,
  trend,
  trendUp,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-md bg-primary-50 p-1.5 text-primary-800 dark:bg-primary-950 dark:text-primary-300">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="mt-1 text-xs text-muted-foreground">
            <span className={trendUp ? "text-success-500" : "text-danger-500"}>
              {trendUp ? "↑" : "↓"} {trend}
            </span>{" "}
            vs last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { data: stats, loading: statsLoading } = useApi<DashboardStats>(
    "/api/dashboard/stats",
    "GET"
  );

  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const displayName = user?.name || t("common.welcome");
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t("common.goodMorning")
      : hour < 17
      ? t("common.goodAfternoon")
      : t("common.goodEvening");

  return (
    <DashboardLayout
      pageTitle={`${greeting}, ${displayName}`}
      breadcrumbs={[{ label: t("navigation.dashboard") }]}
    >
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("navigation.students")}
          value={stats?.totalStudents ?? "–"}
          icon={<GraduationCap className="h-4 w-4" />}
          trend="5%"
          trendUp={true}
        />
        <StatCard
          title={t("navigation.teachers")}
          value={stats?.totalTeachers ?? "–"}
          icon={<Users className="h-4 w-4" />}
          trend="2%"
          trendUp={true}
        />
        <StatCard
          title={t("navigation.classes")}
          value={stats?.totalClasses ?? "–"}
          icon={<School className="h-4 w-4" />}
          trend="1%"
          trendUp={true}
        />
        <StatCard
          title={t("fee.fee")}
          value={`PKR ${(stats?.feeCollected ?? 0).toLocaleString()}`}
          icon={<DollarSign className="h-4 w-4" />}
          trend="12%"
          trendUp={true}
        />
      </div>

      {/* Secondary Stats */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("academic.attendance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.attendancePercentage ?? "–"}%
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-success-500 transition-all"
                style={{
                  width: `${stats?.attendancePercentage ?? 0}%`,
                }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats?.attendanceToday ?? "–"} / {stats?.totalStudents ?? "–"} {t("navigation.students")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("academic.homework")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.homeworkPending ?? "–"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("academic.homeworkPending")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("navigation.announcements")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.announcementsCount ?? "–"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("communication.newAnnouncement")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: t("academic.attendanceMark"), icon: <Calendar className="h-4 w-4" />, href: "/dashboard/attendance" },
            { label: t("academic.homeworkAssign"), icon: <BookOpen className="h-4 w-4" />, href: "/dashboard/homework" },
            { label: t("communication.sendMessage"), icon: <Bell className="h-4 w-4" />, href: "/dashboard/messages" },
            { label: t("report.generateReport"), icon: <TrendingUp className="h-4 w-4" />, href: "/dashboard/reports" },
          ].map((action) => (
            <a
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-800 dark:bg-primary-950 dark:text-primary-300">
                {action.icon}
              </div>
              <span className="text-sm font-medium">{action.label}</span>
            </a>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
