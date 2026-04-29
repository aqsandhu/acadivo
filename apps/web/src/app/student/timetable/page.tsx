"use client";

import { useEffect, useState } from "react";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TimetableGrid } from "@/components/dashboard/TimetableGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { mockApi } from "@/services/mockApi";
import type { TimetableSlot } from "@/types";

export default function StudentTimetablePage() {
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockApi.getTimetable("10th", "A").then((t) => { setSlots(t); setLoading(false); });
  }, []);

  return (
    <>
      <StudentSidebar />
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">My Timetable</h1>
          {loading ? <Skeleton className="h-[500px]" /> : <TimetableGrid slots={slots} />}
        </div>
      </DashboardLayout>
    </>
  );
}
