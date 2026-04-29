"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarClock, Save, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectOption } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/useToast";
import { Toaster } from "@/components/ui/toast";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];
const SUBJECTS = ["Math", "Physics", "Chemistry", "Biology", "English", "Urdu", "Islamiat", "Pak Studies", "Computer Science"];
const TEACHERS = ["Ali Khan", "Fatima Ahmed", "Hassan Raza", "Ayesha Iqbal", "Omar Javed"];

interface Slot {
  subject?: string;
  teacher?: string;
}

export default function AdminTimetablePage() {
  const { t } = useTranslation();
  const { toasts, addToast, removeToast } = useToast();
  const [selectedClass, setSelectedClass] = useState("Class 1");
  const [timetable, setTimetable] = useState<Record<string, Record<number, Slot>>>({});
  const [dragItem, setDragItem] = useState<{ subject: string; teacher: string } | null>(null);

  const handleDrop = (day: string, period: number) => {
    if (!dragItem) return;
    setTimetable((prev) => ({
      ...prev,
      [day]: { ...prev[day], [period]: dragItem },
    }));
    setDragItem(null);
  };

  const handleSave = () => {
    addToast({ title: "Success", description: "Timetable saved", variant: "success" });
  };

  return (
    <div className="space-y-6">
      <Toaster toasts={toasts} removeToast={removeToast} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{t("nav.timetable")}</h2>
        <div className="flex gap-2">
          <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            {Array.from({ length: 10 }).map((_, i) => <SelectOption key={i} value={`Class ${i + 1}`}>Class {i + 1}</SelectOption>)}
          </Select>
          <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" />Save</Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Subjects (drag to assign)</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {SUBJECTS.map((subject) => (
            <div
              key={subject}
              draggable
              onDragStart={() => setDragItem({ subject, teacher: TEACHERS[Math.floor(Math.random() * TEACHERS.length)] })}
              className="cursor-move rounded-md border bg-muted px-3 py-2 text-sm font-medium hover:bg-muted/80"
            >
              {subject}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto p-4">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 text-left text-sm font-medium">Day / Period</th>
                {PERIODS.map((p) => (
                  <th key={p} className="border p-2 text-center text-sm font-medium">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => (
                <tr key={day}>
                  <td className="border p-2 text-sm font-medium">{day}</td>
                  {PERIODS.map((period) => {
                    const slot = timetable[day]?.[period];
                    return (
                      <td
                        key={period}
                        className="border p-2 text-center min-w-[100px] h-16"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(day, period)}
                      >
                        {slot ? (
                          <div className="text-xs">
                            <div className="font-semibold">{slot.subject}</div>
                            <div className="text-muted-foreground">{slot.teacher}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
