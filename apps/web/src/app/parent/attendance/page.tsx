"use client";

import { useEffect, useState } from "react";
import { ParentSidebar } from "@/components/layout/ParentSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AttendanceCalendar } from "@/components/dashboard/AttendanceCalendar";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { mockApi } from "@/services/apiClient";
import type { AttendanceRecord, ChildProfile } from "@/types";
import { AlertTriangle } from "lucide-react";

export default function ParentAttendancePage() {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockApi.getChildren().then((c) => {
      setChildren(c);
      if (c.length > 0) setSelectedChild(c[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedChild) return;
    setLoading(true);
    Promise.all([mockApi.getAttendance(), mockApi.getAttendanceSummary(selectedChild)]).then(([r, s]) => {
      setRecords(r);
      setSummary(s);
      setLoading(false);
    });
  }, [selectedChild]);

  const absentStreak = 3; // mock

  return (
    <>
      <ParentSidebar />
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Child Attendance</h1>
          <div>
            <Label>Select Child</Label>
            <Select value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)}>
              {children.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </Select>
          </div>

          {absentStreak >= 3 && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <p className="font-medium">Absence Alert</p>
                <p className="text-sm">Your child has been absent for {absentStreak} consecutive days.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loading ? [1,2,3,4].map(i => <Skeleton key={i} className="h-24" />) : (
              <>
                <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{summary?.total}</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Present</p><p className="text-2xl font-bold text-green-600">{summary?.present}</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Absent</p><p className="text-2xl font-bold text-red-600">{summary?.absent}</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">%</p><p className="text-2xl font-bold text-blue-600">{summary?.percentage}%</p></CardContent></Card>
              </>
            )}
          </div>

          {loading ? <Skeleton className="h-80" /> : <AttendanceCalendar records={records} />}
        </div>
      </DashboardLayout>
    </>
  );
}
