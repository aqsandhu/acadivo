"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import type { TimetableSlot } from "@/types";

interface TimetableGridProps {
  slots: TimetableSlot[];
  editable?: boolean;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export function TimetableGrid({ slots, editable = false }: TimetableGridProps) {
  const slotMap = new Map<string, TimetableSlot>();
  slots.forEach((s) => slotMap.set(`${s.day}-${s.period}`, s));

  return (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-left font-medium">Period</th>
              {DAYS.map((d) => (
                <th key={d} className="p-3 text-center font-medium">{d.slice(0, 3)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((period) => (
              <tr key={period} className="border-b last:border-0">
                <td className="p-3 font-medium text-muted-foreground">P{period}</td>
                {DAYS.map((day) => {
                  const slot = slotMap.get(`${day}-${period}`);
                  return (
                    <td key={`${day}-${period}`} className="p-2">
                      {slot ? (
                        <div className={cn("rounded-md p-2 text-center", editable ? "bg-primary/10 cursor-pointer" : "bg-primary/5")}>
                          <p className="font-medium text-xs">{slot.subject}</p>
                          <p className="text-[10px] text-muted-foreground">{slot.teacherName}</p>
                          <p className="text-[10px] text-muted-foreground">{slot.room}</p>
                        </div>
                      ) : (
                        <div className="h-full min-h-[60px] rounded-md bg-muted/30" />
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
  );
}
