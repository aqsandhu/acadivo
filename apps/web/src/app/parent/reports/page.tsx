"use client";

import { useEffect, useState } from "react";
import { ParentSidebar } from "@/components/layout/ParentSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ReportRequestForm } from "@/components/dashboard/ReportRequestForm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { createReportRequest, getChildren, getReportRequests } from "@/services/apiClient";
import type { ReportRequest, ChildProfile } from "@/types";
import { FileBadge, Download } from "lucide-react";

export default function ParentReportsPage() {
  const [requests, setRequests] = useState<ReportRequest[]>([]);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [r, c] = await Promise.all([getReportRequests(), getChildren()]);
      setRequests(r);
      setChildren(c);
      setLoading(false);
    }
    load();
  }, []);

  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    async function load() {
      const [r, c] = await Promise.all([getReportRequests(), getChildren()]);
      setRequests(r);
      setChildren(c);
      // Extract unique teachers from requests instead of hardcoding
      const teacherMap = new Map<string, string>();
      r.forEach((req: any) => { if (req.teacherId && req.teacherName) teacherMap.set(req.teacherId, req.teacherName); });
      setTeachers(Array.from(teacherMap.entries()).map(([id, name]) => ({ id, name })));
      setLoading(false);
    }
    load();
  }, []);

  const handleRequest = async (data: any) => {
    await createReportRequest(data);
    alert("Report request submitted!");
  };

  return (
    <>
      <ParentSidebar />
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Report Requests</h1>
          <ReportRequestForm
            children={children.map((c) => ({ id: c.id, name: c.name }))}
            teachers={teachers.length > 0 ? teachers : [{ id: "", name: "No teachers available" }]}
            onSubmit={handleRequest}
          />
          <h2 className="text-lg font-semibold">My Requests</h2>
          {loading ? <div className="space-y-3"><Skeleton className="h-32" /><Skeleton className="h-32" /></div> : (
            <div className="space-y-3">
              {requests.map((r) => (
                <Card key={r.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileBadge className="h-5 w-5 text-primary" />
                        <p className="font-medium">{r.type} Report — {r.studentName}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">Teacher: {r.teacherName}</p>
                      <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={r.status === "completed" ? "default" : r.status === "pending" ? "secondary" : "destructive"}>{r.status}</Badge>
                      {r.reportUrl && <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-1" /> PDF</Button>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
