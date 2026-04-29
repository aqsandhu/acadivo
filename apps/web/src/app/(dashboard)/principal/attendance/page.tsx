"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ClipboardList, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectOption } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useMockApi, getAttendance, getStudents } from "@/services/apiClient";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";

export default function PrincipalAttendancePage() {
  const { t } = useTranslation();
  const [classFilter, setClassFilter] = useState("");
  const { data: attendance, loading } = useMockApi(() => getAttendance({ class: classFilter || undefined }));
  const { data: students } = useMockApi(getStudents);

  const today = new Date().toISOString().split("T")[0];
  const todayAttendance = attendance?.filter((a) => a.date === today) || [];
  const absentStudents = todayAttendance.filter((a) => a.status === "ABSENT");
  const lateStudents = todayAttendance.filter((a) => a.status === "LATE");

  const monthlyTrend = [
    { month: "Jan", present: 92, absent: 5, late: 3 },
    { month: "Feb", present: 94, absent: 4, late: 2 },
    { month: "Mar", present: 90, absent: 7, late: 3 },
    { month: "Apr", present: 93, absent: 5, late: 2 },
    { month: "May", present: 95, absent: 3, late: 2 },
    { month: "Jun", present: 91, absent: 6, late: 3 },
  ];

  const classSummary = students
    ? Object.entries(students.reduce((acc, s) => {
        acc[s.class] = (acc[s.class] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)).map(([cls, count]) => ({
        class: cls,
        total: count,
        present: Math.round(count * 0.92),
        absent: Math.round(count * 0.05),
        late: Math.round(count * 0.03),
      }))
    : [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t("nav.attendance")}</h2>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Students</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{students?.length || 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Present Today</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{todayAttendance.filter((a) => a.status === "PRESENT").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Absent</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{absentStudents.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Late</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-amber-600">{lateStudents.length}</div></CardContent></Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader><CardTitle>Monthly Trends</CardTitle></CardHeader><CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip />
              <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Absent Students</CardTitle></CardHeader><CardContent className="h-64 overflow-y-auto">
          {absentStudents.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">No absent students today</div>
          ) : (
            <div className="space-y-2">
              {absentStudents.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-md border p-2">
                  <div><div className="font-medium text-sm">{s.studentName}</div><div className="text-xs text-muted-foreground">{s.class} - {s.section}</div></div>
                  <Badge variant="destructive">Absent</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Class-wise Summary</CardTitle>
          <Select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <SelectOption value="">All Classes</SelectOption>
            {Array.from({ length: 10 }).map((_, i) => <SelectOption key={i} value={`Class ${i + 1}`}>Class {i + 1}</SelectOption>)}
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Class</TableHead><TableHead>Total</TableHead><TableHead>Present</TableHead><TableHead>Absent</TableHead><TableHead>Late</TableHead><TableHead>Attendance %</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {classSummary.map((c) => (
                  <TableRow key={c.class}>
                    <TableCell className="font-medium">{c.class}</TableCell>
                    <TableCell>{c.total}</TableCell>
                    <TableCell className="text-green-600">{c.present}</TableCell>
                    <TableCell className="text-red-600">{c.absent}</TableCell>
                    <TableCell className="text-amber-600">{c.late}</TableCell>
                    <TableCell>{((c.present / c.total) * 100).toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
