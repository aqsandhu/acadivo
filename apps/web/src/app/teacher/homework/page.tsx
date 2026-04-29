"use client";

import { useEffect, useState } from "react";
import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { HomeworkCard } from "@/components/dashboard/HomeworkCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { mockApi } from "@/services/mockApi";
import type { HomeworkItem, HomeworkSubmission } from "@/types";
import { Plus, X, Download } from "lucide-react";

export default function TeacherHomeworkPage() {
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedHw, setSelectedHw] = useState<HomeworkItem | null>(null);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);

  useEffect(() => {
    mockApi.getHomework().then((h) => { setHomework(h); setLoading(false); });
  }, []);

  const viewSubmissions = async (hw: HomeworkItem) => {
    setSelectedHw(hw);
    const subs = await mockApi.getSubmissions(hw.id);
    setSubmissions(subs);
  };

  return (
    <>
      <TeacherSidebar />
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Homework Management</h1>
            <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" /> Create Homework</Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2,3].map(i => <Skeleton key={i} className="h-40" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {homework.map((h) => (
                <div key={h.id} className="relative">
                  <HomeworkCard homework={h} />
                  <Button size="sm" variant="outline" className="absolute bottom-4 right-4" onClick={() => viewSubmissions(h)}>View Submissions</Button>
                </div>
              ))}
            </div>
          )}

          {showCreate && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Create Homework</h3>
                    <Button size="icon" variant="ghost" onClick={() => setShowCreate(false)}><X className="h-4 w-4" /></Button>
                  </div>
                  <div><Label>Title</Label><Input /></div>
                  <div><Label>Description</Label><Textarea /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Class</Label><Select><SelectItem value="10th">10th</SelectItem></Select></div>
                    <div><Label>Section</Label><Select><SelectItem value="A">A</SelectItem></Select></div>
                  </div>
                  <div><Label>Subject</Label><Select><SelectItem value="Mathematics">Mathematics</SelectItem></Select></div>
                  <div><Label>Due Date</Label><input type="datetime-local" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" /></div>
                  <div><Label>Max Marks</Label><Input type="number" defaultValue={20} /></div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowCreate(false)}>Save Draft</Button>
                    <Button onClick={() => setShowCreate(false)}>Publish</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedHw && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Submissions: {selectedHw.title}</h3>
                    <Button size="icon" variant="ghost" onClick={() => setSelectedHw(null)}><X className="h-4 w-4" /></Button>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50"><tr><th className="text-left p-2">Student</th><th>Status</th><th>Marks</th><th>Action</th></tr></thead>
                    <tbody>
                      {submissions.map((s) => (
                        <tr key={s.id} className="border-t">
                          <td className="p-2">{s.studentName}</td>
                          <td className="p-2 text-center">{s.status}</td>
                          <td className="p-2 text-center">{s.marks ?? "-"}</td>
                          <td className="p-2 text-center">
                            <Button size="sm" variant="outline">Grade</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
