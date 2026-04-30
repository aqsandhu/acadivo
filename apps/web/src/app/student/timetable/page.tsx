"use client";

import { useEffect, useState } from "react";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TimetableGrid } from "@/components/dashboard/TimetableGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { getTimetable, getMe } from "@/services/apiClient";
import type { TimetableSlot, User } from "@/types";
import { AlertTriangle, Clock } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";

export default function StudentTimetablePage() {
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadTimetable() {
      try {
        const me = await getMe();
        if (me.success && me.data) {
          setUser(me.data);
          const studentClass = (me.data as any)?.student?.class?.name || (me.data as any)?.class || "";
          const studentSection = (me.data as any)?.student?.section?.name || (me.data as any)?.section || "";
          const t = await getTimetable(studentClass || undefined, studentSection || undefined);
          setSlots(t);
          const latest = t.length > 0
            ? t.map((s: any) => s.updatedAt || s.createdAt).filter(Boolean).sort().reverse()[0]
            : null;
          setLastUpdated(latest);
        }
      } catch {
        // fallback to empty
      } finally {
        setLoading(false);
      }
    }
    loadTimetable();
  }, []);

  const isRecentlyUpdated = lastUpdated
    ? Date.now() - new Date(lastUpdated).getTime() < 24 * 60 * 60 * 1000
    : false;

  return (
    <>
      <StudentSidebar />
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">My Timetable</h1>
            {lastUpdated && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Last updated: {formatDistanceToNow(new Date(lastUpdated))}</span>
              </div>
            )}
          </div>

          {isRecentlyUpdated && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Timetable Updated Recently</p>
                <p className="text-sm">Your class timetable has been updated. Please review the changes.</p>
              </div>
            </div>
          )}

          {loading ? <Skeleton className="h-[500px]" /> : <TimetableGrid slots={slots} />}
        </div>
      </DashboardLayout>
    </>
  );
}
