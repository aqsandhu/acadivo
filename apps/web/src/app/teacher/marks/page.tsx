"use client";

import { useEffect, useState } from "react";
import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MarkSheet } from "@/components/dashboard/MarkSheet";
import { Select, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getMarks, saveMarks } from "@/services/apiClient";
import type { MarkEntry } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function TeacherMarksPage() {
  const [entries, setEntries] = useState<MarkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [className, setClassName] = useState("10th");
  const [section, setSection] = useState("A");
  const [subject, setSubject] = useState("Mathematics");
  const [examType, setExamType] = useState("Quiz");

  useEffect(() => {
    setLoading(true);
    getMarks({ className, section, subject, examType }).then((m) => { setEntries(m); setLoading(false); });
  }, [className, section, subject, examType]);

  const chartData = entries.map((e) => ({ name: e.studentName.split(" ")[0], marks: e.obtainedMarks }));

  return (
    <>
      <TeacherSidebar />
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Marks Entry</h1>
          <div className="flex flex-wrap gap-4 items-end">
            <div><Label>Class</Label><Select value={className} onValueChange={(value) => setClassName(value)}><SelectItem value="9th">9th</SelectItem><SelectItem value="10th">10th</SelectItem></Select></div>
            <div><Label>Section</Label><Select value={section} onValueChange={(value) => setSection(value)}><SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem><SelectItem value="C">C</SelectItem></Select></div>
            <div><Label>Subject</Label><Select value={subject} onValueChange={(value) => setSubject(value)}><SelectItem value="Mathematics">Mathematics</SelectItem><SelectItem value="Physics">Physics</SelectItem></Select></div>
            <div><Label>Exam Type</Label><Select value={examType} onValueChange={(value) => setExamType(value)}><SelectItem value="Quiz">Quiz</SelectItem><SelectItem value="Midterm">Midterm</SelectItem><SelectItem value="Final">Final</SelectItem><SelectItem value="Assignment">Assignment</SelectItem></Select></div>
          </div>

          {loading ? <Skeleton className="h-96" /> : (
            <>
              <MarkSheet entries={entries} onSave={async (data) => { await saveMarks(data); alert("Saved!"); }} />
              <div className="h-72">
                <h3 className="text-lg font-semibold mb-3">Class Performance</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="marks" fill="#3b82f6" /></BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
