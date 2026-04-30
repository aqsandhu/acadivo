"use client";

import { useEffect, useState } from "react";
import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getReportRequests } from "@/services/apiClient";
import type { ReportRequest } from "@/types";
import { FileBadge, Download, CheckCircle2 } from "lucide-react";

export default function TeacherReportsPage() {
  const [requests, setRequests] = useState<ReportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getReportRequests().then((r) => { setRequests(r); setLoading(false); });
  }, []);

  return (
    <>
      <TeacherSidebar />
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Reports</h1>
          {loading ? (
            <div className="space-y-3">
              {[1,2].map(i => <Skeleton key={i} className="h-32" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <Card key={r.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileBadge className="h-5 w-5 text-primary" />
                        <p className="font-medium">{r.type} Report — {r.studentName}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">Requested by {r.parentId} on {new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={r.status === "completed" ? "default" : r.status === "pending" ? "secondary" : "destructive"}>{r.status}</Badge>
                      {r.status === "pending" && <Button size="sm" onClick={() => setShowForm(true)}>Generate</Button>}
                      {r.reportUrl && <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-1" /> PDF</Button>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {showForm && (
            <Card className="mt-4">
              <CardContent className="p-5 space-y-4">
                <h3 className="font-semibold">Generate Report</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Attendance Summary</Label><Textarea rows={2} defaultValue="Present: 25/30 days (83%)" /></div>
                  <div><Label>Subject Grades</Label><Textarea rows={2} defaultValue="Math: A, Physics: B, Chemistry: B" /></div>
                </div>
                <div>
                  <Label>Behavior Assessment</Label>
                  <Select defaultValue="good"><SelectItem value="excellent">Excellent</SelectItem><SelectItem value="good">Good</SelectItem><SelectItem value="satisfactory">Satisfactory</SelectItem><SelectItem value="needs improvement">Needs Improvement</SelectItem></Select>
                </div>
                <div><Label>Teacher Comments</Label><Textarea rows={3} placeholder="Enter comments..." /></div>
                <Button onClick={() => setShowForm(false)}><CheckCircle2 className="h-4 w-4 mr-2" /> Generate PDF</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
