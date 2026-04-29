"use client";

import { useEffect, useState } from "react";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { mockApi } from "@/services/mockApi";
import type { MarkEntry } from "@/types";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function StudentMarksPage() {
  const [marks, setMarks] = useState<MarkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    mockApi.getMarks().then((m) => { setMarks(m); setLoading(false); });
  }, []);

  const filtered = filter === "All" ? marks : marks.filter((m) => m.examType === filter);

  const trendData = [
    { exam: "Quiz 1", avg: 72 },
    { exam: "Quiz 2", avg: 78 },
    { exam: "Midterm", avg: 84 },
    { exam: "Quiz 3", avg: 80 },
    { exam: "Final", avg: 88 },
  ];

  return (
    <>
      <StudentSidebar />
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">My Marks</h1>
          <div>
            <Label>Filter by Exam Type</Label>
            <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Quiz">Quiz</SelectItem>
              <SelectItem value="Midterm">Midterm</SelectItem>
              <SelectItem value="Final">Final</SelectItem>
              <SelectItem value="Assignment">Assignment</SelectItem>
            </Select>
          </div>
          {loading ? <Skeleton className="h-96" /> : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Obtained</TableHead>
                    <TableHead>%</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.subject}</TableCell>
                      <TableCell>{m.examType}</TableCell>
                      <TableCell>{m.totalMarks}</TableCell>
                      <TableCell>{m.obtainedMarks}</TableCell>
                      <TableCell>{m.percentage}%</TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${m.grade.startsWith("A") ? "bg-green-100 text-green-700" : m.grade.startsWith("B") ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {m.grade}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="h-72">
            <h3 className="text-lg font-semibold mb-3">Progress Over Time</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="exam" /><YAxis domain={[0, 100]} /><Tooltip /><Line type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={2} /></LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
