"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ParentSidebar } from "@/components/layout/ParentSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AttendanceCalendar } from "@/components/dashboard/AttendanceCalendar";
import { HomeworkCard } from "@/components/dashboard/HomeworkCard";
import { ResultCard } from "@/components/dashboard/ResultCard";
import { FeeRecordCard } from "@/components/dashboard/FeeRecordCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getAttendance, getChildById, getFeeRecords, getHomework, getReportRequests, getResults } from "@/services/apiClient";
import type { ChildProfile, AttendanceRecord, HomeworkItem, ResultItem, FeeRecord, ReportRequest } from "@/types";
import { GraduationCap, Hash, TrendingUp, BookOpen, CreditCard } from "lucide-react";

export default function ParentChildDetailPage() {
  const { studentId } = useParams();
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [reports, setReports] = useState<ReportRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [c, a, h, r, f, rep] = await Promise.all([
        getChildById(studentId as string),
        getAttendance(),
        getHomework(),
        getResults(studentId as string),
        getFeeRecords(studentId as string),
        getReportRequests(),
      ]);
      setChild(c || null);
      setAttendance(a);
      setHomework(h);
      setResults(r);
      setFees(f);
      setReports(rep.filter((x) => x.studentId === studentId));
      setLoading(false);
    }
    load();
  }, [studentId]);

  return (
    <>
      <ParentSidebar />
      <DashboardLayout>
        <div className="space-y-6">
          {loading ? <Skeleton className="h-48" /> : child && (
            <div className="flex items-center gap-4 p-4 bg-card border rounded-xl">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                {child.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-bold">{child.name}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4" /> Class {child.className} Section {child.section}</span>
                  <span className="flex items-center gap-1"><Hash className="h-4 w-4" /> Roll #{child.rollNumber}</span>
                  <span className="flex items-center gap-1"><TrendingUp className="h-4 w-4" /> {child.attendancePercentage}% Attendance</span>
                </div>
              </div>
            </div>
          )}

          <Tabs value="attendance">
            <TabsList>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="homework">Homework</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="fee">Fee</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </TabsList>
            <TabsContent value="attendance">
              {loading ? <Skeleton className="h-80" /> : <AttendanceCalendar records={attendance} />}
            </TabsContent>
            <TabsContent value="homework">
              {loading ? <Skeleton className="h-80" /> : (
                <div className="space-y-3">
                  {homework.map((h) => <HomeworkCard key={h.id} homework={h} role="student" />)}
                </div>
              )}
            </TabsContent>
            <TabsContent value="results">
              {loading ? <Skeleton className="h-80" /> : (
                <div className="space-y-3">{results.map((r) => <ResultCard key={r.id} result={r} />)}</div>
              )}
            </TabsContent>
            <TabsContent value="fee">
              {loading ? <Skeleton className="h-80" /> : (
                <div className="space-y-3">{fees.map((f) => <FeeRecordCard key={f.id} record={f} />)}</div>
              )}
            </TabsContent>
            <TabsContent value="reports">
              <div className="space-y-3">
                {reports.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{r.type} Report</p>
                      <p className="text-sm text-muted-foreground">Status: {r.status}</p>
                    </div>
                    <Badge variant={r.status === "completed" ? "default" : "secondary"}>{r.status}</Badge>
                  </div>
                ))}
                <Button>Request New Report</Button>
              </div>
            </TabsContent>
            <TabsContent value="messages">
              <Button>Message Teacher</Button>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
}
