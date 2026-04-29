"use client";

import { useEffect, useState } from "react";
import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ClassCard } from "@/components/dashboard/ClassCard";
import { AnnouncementCard } from "@/components/dashboard/AnnouncementCard";
import { Skeleton } from "@/components/ui/skeleton";
import { mockApi } from "@/services/mockApi";
import { useTranslation } from "react-i18next";
import type { ClassItem, Announcement } from "@/types";
import { BookOpen, ClipboardCheck, MessageSquare, FileBadge, Bell } from "lucide-react";

export default function TeacherDashboard() {
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [u, s, c, a] = await Promise.all([
        mockApi.getCurrentUser("TEACHER"),
        mockApi.getTeacherStats(),
        mockApi.getTodayClasses(),
        mockApi.getAnnouncements(),
      ]);
      setUser(u);
      setStats(s);
      setClasses(c);
      setAnnouncements(a);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      <TeacherSidebar />
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            {loading ? <Skeleton className="h-8 w-64" /> : (
              <h1 className="text-2xl font-bold">{t("common.welcome")}, {user?.name}!</h1>
            )}
            <p className="text-muted-foreground">Here is your teaching overview for today</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard icon={BookOpen} value={stats?.classesToday ?? 0} label="Classes Today" loading={loading} />
            <StatsCard icon={ClipboardCheck} value={stats?.pendingHomework ?? 0} label="Pending Homework" loading={loading} />
            <StatsCard icon={MessageSquare} value={stats?.unreadMessages ?? 0} label="Unread Messages" loading={loading} />
            <StatsCard icon={FileBadge} value={stats?.reportRequests ?? 0} label="Report Requests" loading={loading} />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Today's Classes</h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
              </div>
            ) : classes.length === 0 ? (
              <p className="text-muted-foreground">No classes scheduled for today</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map((c) => <ClassCard key={c.id} classItem={c} />)}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Recent Announcements</h2>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.slice(0, 3).map((a) => <AnnouncementCard key={a.id} announcement={a} />)}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
