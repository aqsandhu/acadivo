"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ClipboardList, Check, X, Clock, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectOption } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useMockApi, getAttendance, getStudents, type AttendanceRecord } from "@/services/apiClient";
import { useToast } from "@/hooks/useToast";
import { Toaster } from "@/components/ui/toast";

export default function AdminAttendancePage() {
  const { t } = useTranslation();
  const { toasts, addToast, removeToast } = useToast();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [attendanceMap, setAttendanceMap] = useState<Record<string, "PRESENT" | "ABSENT" | "LATE">({});

  const { data: students, loading: studentsLoading } = useMockApi(() =>
    getStudents({ class: classFilter || undefined, section: sectionFilter || undefined })
  );

  const handleMark = (studentId: string, status: "PRESENT" | "ABSENT" | "LATE") => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = () => {
    addToast({ title: "Success", description: "Attendance saved", variant: "success" });
  };

  const absentees = students?.filter((s) => attendanceMap[s.id] === "ABSENT") || [];

  return (
    <div className="space-y-6">
      <Toaster toasts={toasts} removeToast={removeToast} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{t("nav.attendance")}</h2>
        <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" />Save Attendance</Button>
      </div>

      <Card>
        <CardContent className="flex flex-wrap gap-4 p-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <Select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <SelectOption value="">All Classes</SelectOption>
            {Array.from({ length: 10 }).map((_, i) => <SelectOption key={i} value={`Class ${i + 1}`}>Class {i + 1}</SelectOption>)}
          </Select>
          <Select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
            <SelectOption value="">All Sections</SelectOption>
            <SelectOption value="A">A</SelectOption>
            <SelectOption value="B">B</SelectOption>
            <SelectOption value="C">C</SelectOption>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Present</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{Object.values(attendanceMap).filter((s) => s === "PRESENT").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Absent</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{Object.values(attendanceMap).filter((s) => s === "ABSENT").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Late</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-amber-600">{Object.values(attendanceMap).filter((s) => s === "LATE").length}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Mark Attendance</CardTitle></CardHeader>
        <CardContent className="p-0">
          {studentsLoading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : !students?.length ? (
            <div className="py-12 text-center text-muted-foreground">{t("common.noData")}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Roll #</TableHead><TableHead>Name</TableHead><TableHead>Class</TableHead><TableHead>Section</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const status = attendanceMap[student.id];
                    return (
                      <TableRow key={student.id}>
                        <TableCell>{student.rollNumber}</TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.class}</TableCell>
                        <TableCell>{student.section}</TableCell>
                        <TableCell>
                          {status ? (
                            <Badge variant={status === "PRESENT" ? "default" : status === "ABSENT" ? "destructive" : "secondary"}>{status}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant={status === "PRESENT" ? "default" : "outline"} onClick={() => handleMark(student.id, "PRESENT")}><Check className="h-4 w-4" /></Button>
                            <Button size="sm" variant={status === "ABSENT" ? "destructive" : "outline"} onClick={() => handleMark(student.id, "ABSENT")}><X className="h-4 w-4" /></Button>
                            <Button size="sm" variant={status === "LATE" ? "secondary" : "outline"} onClick={() => handleMark(student.id, "LATE")}><Clock className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
