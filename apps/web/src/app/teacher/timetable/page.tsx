"use client";

import { useEffect, useState } from "react";
import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TimetableGrid } from "@/components/dashboard/TimetableGrid";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getTimetable } from "@/services/apiClient";
import type { TimetableSlot } from "@/types";
import { Printer, Clock } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";

export default function TeacherTimetablePage() {
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    getTimetable().then((t) => {
      setSlots(t);
      if (t.length > 0 && t[0].updatedAt) {
        setLastUpdated(new Date(t[0].updatedAt));
      }
      setLoading(false);
    });
  }, []);

  return (
    <>
      <TeacherSidebar />
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">My Timetable</h1>
              {lastUpdated && (
                <p className="text-sm text-amber-600 flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  Last updated: {formatDistanceToNow(lastUpdated)}
                </p>
              )}
            </div>
            <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4 mr-2" /> Print</Button>
          </div>
          {loading ? <Skeleton className="h-[500px]" /> : <TimetableGrid slots={slots} />}
        </div>
      </DashboardLayout>
    </>
  );
}
