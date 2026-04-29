"use client";

import { useEffect, useState } from "react";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { HomeworkCard } from "@/components/dashboard/HomeworkCard";
import { TimetableGrid } from "@/components/dashboard/TimetableGrid";
import { AnnouncementCard } from "@/components/dashboard/AnnouncementCard";
import { Skeleton } from "@/components/ui/skeleton";
import { mockApi } from "@/services/mockApi";
import { useTranslation } from "react-i18next";
import type { HomeworkItem, Announcement, TimetableSlot } from "@/types";
import { ClipboardCheck, FileText, Bell, Trophy, GraduationCap } from "lucide-react";

export default function StudentDashboard() {
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [u, s, h, a, t] = await Promise.all([
        mockApi.getCurrentUser("STUDENT"),
        mockApi.getStudentStats(),
        mockApi.getHomework(),
        mockApi.getAnnouncements(),
        mockApi.getTimetable("10th", "A"),
      ]);
      setUser(u);
      setStats(s);
      setHomework(h);
      setAnnouncements(a);
      setTimetable(t);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      <StudentSidebar />
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            {loading ? <Skeleton className="h-8 w-64" /> : (
              <h1 className="text-2xl font-bold">{t("common.welcome")}, {user?.name}!</h1>
            )}
            <p className="text-muted-foreground">Class 10th A</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard icon={ClipboardCheck} value={`${stats?.attendancePercentage ?? 0}%`} label="Attendance" loading={loading} />
            <StatsCard icon={FileText} value={stats?.pendingHomework ?? 0} label="Pending Homework" loading={loading} />
            <StatsCard icon={Bell} value={stats?.unreadNotifications ?? 0} label="Unread Notifications" loading={loading} />
            <StatsCard icon={Trophy} value={stats?.latestResult ?? "-"} label="Latest Result" loading={loading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">Today's Classes</h2>
              {loading ? <Skeleton className="h-64" /> : <TimetableGrid slots={timetable.slice(0, 5)} />}
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-3">Pending Homework</h2>
              {loading ? (
                <div className="space-y-3"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
              ) : (
                <div className="space-y-3">
                  {homework.slice(0, 2).map((h) => <HomeworkCard key={h.id} homework={h} role="student" />)}
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Announcements</h2>
            {loading ? (
              <div className="space-y-3"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
            ) : (
              <div className="space-y-3">
                {announcements.slice(0, 2).map((a) => <AnnouncementCard key={a.id} announcement={a} />)}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
