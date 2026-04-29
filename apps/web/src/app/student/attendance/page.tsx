"use client";

import { useEffect, useState } from "react";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AttendanceCalendar } from "@/components/dashboard/AttendanceCalendar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { mockApi } from "@/services/mockApi";
import type { AttendanceRecord } from "@/types";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function StudentAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [r, s] = await Promise.all([mockApi.getAttendance(), mockApi.getAttendanceSummary()]);
      setRecords(r);
      setSummary(s);
      setLoading(false);
    }
    load();
  }, []);

  const trendData = [
    { month: "Jan", percentage: 88 },
    { month: "Feb", percentage: 90 },
    { month: "Mar", percentage: 85 },
    { month: "Apr", percentage: 92 },
    { month: "May", percentage: summary?.percentage ?? 92 },
  ];

  return (
    <>
      <StudentSidebar />
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">My Attendance</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loading ? [1,2,3,4].map(i => <Skeleton key={i} className="h-24" />) : (
              <>
                <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Total Days</p><p className="text-2xl font-bold">{summary.total}</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Present</p><p className="text-2xl font-bold text-green-600">{summary.present}</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Absent</p><p className="text-2xl font-bold text-red-600">{summary.absent}</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Percentage</p><p className="text-2xl font-bold text-blue-600">{summary.percentage}%</p></CardContent></Card>
              </>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">Calendar</h2>
              {loading ? <Skeleton className="h-80" /> : <AttendanceCalendar records={records} />}
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-3">Attendance Trend</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis domain={[0, 100]} /><Tooltip /><Line type="monotone" dataKey="percentage" stroke="#3b82f6" strokeWidth={2} /></LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
