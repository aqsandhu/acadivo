"use client";

import { useEffect, useState } from "react";
import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { mockApi } from "@/services/apiClient";
import type { AttendanceRecord } from "@/types";
import { cn } from "@/utils/cn";
import { CheckCircle2, XCircle, Clock, ArrowRightCircle } from "lucide-react";

const STATUS_OPTIONS: { value: AttendanceRecord["status"]; label: string; icon: any; color: string }[] = [
  { value: "present", label: "Present", icon: CheckCircle2, color: "bg-green-500 text-white" },
  { value: "absent", label: "Absent", icon: XCircle, color: "bg-red-500 text-white" },
  { value: "late", label: "Late", icon: Clock, color: "bg-yellow-500 text-white" },
  { value: "leave", label: "Leave", icon: ArrowRightCircle, color: "bg-blue-500 text-white" },
];

export default function TeacherAttendancePage() {
  const [className, setClassName] = useState("10th");
  const [section, setSection] = useState("A");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    setLoading(true);
    mockApi.getAttendance(className, section).then((r) => { setRecords(r); setLoading(false); });
  }, [className, section]);

  const updateStatus = (id: string, status: AttendanceRecord["status"]) => {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const markAllPresent = () => {
    setRecords((prev) => prev.map((r) => ({ ...r, status: "present" as const })));
  };

  const save = async () => {
    await mockApi.saveAttendance(records);
    alert("Attendance saved successfully!");
  };

  const summary = { present: records.filter((r) => r.status === "present").length, absent: records.filter((r) => r.status === "absent").length, late: records.filter((r) => r.status === "late").length, leave: records.filter((r) => r.status === "leave").length };

  return (
    <>
      <TeacherSidebar />
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Mark Attendance</h1>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <Label>Class</Label>
              <Select value={className} onChange={(e) => setClassName(e.target.value)}>
                <SelectItem value="9th">9th</SelectItem>
                <SelectItem value="10th">10th</SelectItem>
              </Select>
            </div>
            <div>
              <Label>Section</Label>
              <Select value={section} onChange={(e) => setSection(e.target.value)}>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" />
            </div>
            <Button variant="outline" onClick={markAllPresent}>Mark All Present</Button>
            <Button onClick={save}>Save Attendance</Button>
          </div>

          <div className="flex gap-4 text-sm">
            {Object.entries(summary).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1">
                <span className={cn("inline-block w-3 h-3 rounded-full", k === "present" ? "bg-green-500" : k === "absent" ? "bg-red-500" : k === "late" ? "bg-yellow-500" : "bg-blue-500")} />
                {k}: {v}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3">Student</th>
                    {STATUS_OPTIONS.map((s) => <th key={s.value} className="p-3 text-center">{s.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="p-3 font-medium">{r.studentName}</td>
                      {STATUS_OPTIONS.map((s) => {
                        const Icon = s.icon;
                        return (
                          <td key={s.value} className="p-3 text-center">
                            <button
                              onClick={() => updateStatus(r.id, s.value)}
                              className={cn(
                                "inline-flex items-center justify-center rounded-md p-2 transition-colors",
                                r.status === s.value ? s.color : "bg-muted hover:bg-muted/80"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
