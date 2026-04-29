"use client";

import { useEffect, useState } from "react";
import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TimetableGrid } from "@/components/dashboard/TimetableGrid";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { mockApi } from "@/services/mockApi";
import type { TimetableSlot } from "@/types";
import { Printer } from "lucide-react";

export default function TeacherTimetablePage() {
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockApi.getTimetable().then((t) => { setSlots(t); setLoading(false); });
  }, []);

  return (
    <>
      <TeacherSidebar />
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">My Timetable</h1>
            <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4 mr-2" /> Print</Button>
          </div>
          {loading ? <Skeleton className="h-[500px]" /> : <TimetableGrid slots={slots} />}
        </div>
      </DashboardLayout>
    </>
  );
}
