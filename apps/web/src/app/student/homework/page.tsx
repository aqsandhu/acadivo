"use client";

import { useEffect, useState } from "react";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { HomeworkCard } from "@/components/dashboard/HomeworkCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { mockApi } from "@/services/mockApi";
import type { HomeworkItem, HomeworkSubmission } from "@/types";
import { Upload, X, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function StudentHomeworkPage() {
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<HomeworkItem | null>(null);

  useEffect(() => {
    async function load() {
      const h = await mockApi.getHomework();
      const subs = await mockApi.getSubmissions("HW-1");
      setHomework(h);
      setSubmissions(subs);
      setLoading(false);
    }
    load();
  }, []);

  const isLate = (due: string) => new Date(due) < new Date();

  return (
    <>
      <StudentSidebar />
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">My Homework</h1>
          <div>
            <h2 className="text-lg font-semibold mb-3">Pending</h2>
            {loading ? (
              <div className="space-y-3"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {homework.map((h) => (
                  <div key={h.id}>
                    <HomeworkCard homework={h} role="student" />
                    <Button size="sm" className="mt-2" onClick={() => setSelected(h)}>Submit</Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3">Submitted</h2>
            {loading ? <Skeleton className="h-40" /> : (
              <div className="space-y-2">
                {submissions.map((s) => (
                  <Card key={s.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{s.studentName}</p>
                        <p className="text-sm text-muted-foreground">Submitted {formatDistanceToNow(new Date(s.submittedAt || Date.now()), { addSuffix: true })}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={s.status === "submitted" ? "default" : "destructive"}>{s.status}</Badge>
                        {s.marks !== undefined && <span className="text-sm font-medium">{s.marks} / 20</span>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {selected && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <Card className="w-full max-w-lg">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Submit: {selected.title}</h3>
                    <Button size="icon" variant="ghost" onClick={() => setSelected(null)}><X className="h-4 w-4" /></Button>
                  </div>
                  {isLate(selected.dueDate) && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded-md text-sm">
                      <AlertCircle className="h-4 w-4" /> Late submission — deadline passed
                    </div>
                  )}
                  <Textarea rows={4} placeholder="Write your answer or notes..." />
                  <Button variant="outline"><Upload className="h-4 w-4 mr-2" /> Attach Files</Button>
                  <Button className="w-full"><CheckCircle2 className="h-4 w-4 mr-2" /> Submit Homework</Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
