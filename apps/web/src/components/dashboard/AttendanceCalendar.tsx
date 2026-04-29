"use client";

import { useState, useMemo } from "react";
import { cn } from "@/utils/cn";
import { Card, CardContent } from "@/components/ui/card";

interface AttendanceCalendarProps {
  records: { date: string; status: "present" | "absent" | "late" | "leave" }[];
  month?: number;
  year?: number;
}

export function AttendanceCalendar({ records, month = new Date().getMonth(), year = new Date().getFullYear() }: AttendanceCalendarProps) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const recordMap = useMemo(() => {
    const map = new Map<string, string>();
    records.forEach((r) => {
      const d = new Date(r.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        map.set(d.getDate().toString(), r.status);
      }
    });
    return map;
  }, [records, month, year]);

  const statusColors: Record<string, string> = {
    present: "bg-green-500 text-white",
    absent: "bg-red-500 text-white",
    late: "bg-yellow-500 text-white",
    leave: "bg-blue-500 text-white",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} className="font-semibold text-muted-foreground py-2">{d}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const status = recordMap.get(day.toString());
            return (
              <div
                key={day}
                className={cn(
                  "aspect-square flex items-center justify-center rounded-md text-sm",
                  status ? statusColors[status] : "bg-muted/50 text-muted-foreground"
                )}
              >
                {day}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
