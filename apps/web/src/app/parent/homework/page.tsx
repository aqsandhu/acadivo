"use client";

import { useEffect, useState } from "react";
import { ParentSidebar } from "@/components/layout/ParentSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { HomeworkCard } from "@/components/dashboard/HomeworkCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { mockApi } from "@/services/apiClient";
import type { HomeworkItem, ChildProfile } from "@/types";
import { AlertTriangle } from "lucide-react";

export default function ParentHomeworkPage() {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockApi.getChildren().then((c) => { setChildren(c); if (c.length > 0) setSelectedChild(c[0].id); });
  }, []);

  useEffect(() => {
    setLoading(true);
    mockApi.getHomework().then((h) => { setHomework(h); setLoading(false); });
  }, [selectedChild]);

  const lateCount = homework.filter((h) => new Date(h.dueDate) < new Date()).length;

  return (
    <>
      <ParentSidebar />
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Child Homework</h1>
          <div>
            <Label>Select Child</Label>
            <Select value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)}>
              {children.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </Select>
          </div>

          {lateCount > 0 && (
            <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <p className="font-medium">Late Submission Alert</p>
                <p className="text-sm">{lateCount} homework assignments are past due date.</p>
              </div>
            </div>
          )}

          {loading ? <div className="space-y-3"><Skeleton className="h-32" /><Skeleton className="h-32" /></div> : (
            <div className="space-y-3">
              {homework.map((h) => <HomeworkCard key={h.id} homework={h} role="student" />)}
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
