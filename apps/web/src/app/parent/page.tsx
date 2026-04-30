"use client";

import { useEffect, useState } from "react";
import { ParentSidebar } from "@/components/layout/ParentSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ChildProfileCard } from "@/components/dashboard/ChildProfileCard";
import { AnnouncementCard } from "@/components/dashboard/AnnouncementCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getAnnouncements, getChildren, getCurrentUser, getParentStats } from "@/services/apiClient";
import { useTranslation } from "react-i18next";
import type { ChildProfile, Announcement } from "@/types";
import { MessageSquare, CreditCard, Bell, FileBadge, AlertTriangle } from "lucide-react";

export default function ParentDashboard() {
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [u, s, c, a] = await Promise.all([
        getCurrentUser("PARENT"),
        getParentStats(),
        getChildren(),
        getAnnouncements(),
      ]);
      setUser(u);
      setStats(s);
      setChildren(c);
      setAnnouncements(a);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      <ParentSidebar />
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            {loading ? <Skeleton className="h-8 w-64" /> : (
              <h1 className="text-2xl font-bold">{t("common.welcome")}, {user?.name}!</h1>
            )}
            <p className="text-muted-foreground">Parent of {children.length} children</p>
            {!loading && user?.uniqueId && (
              <p className="text-sm text-blue-600 mt-1">
                <span className="font-medium">Your ID is shared with your child:</span> {user.uniqueId}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard icon={MessageSquare} value={stats?.unreadMessages ?? 0} label="Unread Messages" loading={loading} />
            <StatsCard icon={CreditCard} value={`${stats?.feeDue ?? 0} PKR`} label="Fee Due" loading={loading} trend={{ direction: "up", value: "Due soon" }} />
            <StatsCard icon={Bell} value={stats?.unreadNotifications ?? 0} label="Unread Notifications" loading={loading} />
            <StatsCard icon={FileBadge} value={stats?.pendingReports ?? 0} label="Pending Reports" loading={loading} />
          </div>

          {stats?.feeDue > 0 && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <p className="font-medium">Fee Due Alert</p>
                <p className="text-sm">Total fee due: {stats.feeDue.toLocaleString()} PKR. Please clear before due date.</p>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold mb-3">My Children</h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Skeleton className="h-48" /><Skeleton className="h-48" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {children.map((c) => <ChildProfileCard key={c.id} child={c} />)}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">School Announcements</h2>
            {loading ? <div className="space-y-3"><Skeleton className="h-32" /><Skeleton className="h-32" /></div> : (
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
