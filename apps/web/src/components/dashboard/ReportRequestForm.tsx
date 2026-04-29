"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { FileText } from "lucide-react";

interface ReportRequestFormProps {
  children: { id: string; name: string }[];
  teachers: { id: string; name: string }[];
  onSubmit: (data: { studentId: string; teacherId: string; type: string }) => void;
}

export function ReportRequestForm({ children, teachers, onSubmit }: ReportRequestFormProps) {
  const [studentId, setStudentId] = useState(children[0]?.id || "");
  const [teacherId, setTeacherId] = useState(teachers[0]?.id || "");
  const [type, setType] = useState("Progress");

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Request Report</h3>
        </div>
        <div>
          <Label>Select Child</Label>
          <Select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            {children.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </Select>
        </div>
        <div>
          <Label>Select Teacher</Label>
          <Select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
            {teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </Select>
        </div>
        <div>
          <Label>Report Type</Label>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <SelectItem value="Progress">Progress</SelectItem>
            <SelectItem value="Attendance">Attendance</SelectItem>
            <SelectItem value="Behavior">Behavior</SelectItem>
            <SelectItem value="Comprehensive">Comprehensive</SelectItem>
          </Select>
        </div>
        <Button onClick={() => onSubmit({ studentId, teacherId, type })} className="w-full">Submit Request</Button>
      </CardContent>
    </Card>
  );
}
