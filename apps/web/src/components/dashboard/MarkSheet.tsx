"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import type { MarkEntry } from "@/types";

interface MarkSheetProps {
  entries: MarkEntry[];
  editable?: boolean;
  onSave?: (entries: MarkEntry[]) => void;
}

export function MarkSheet({ entries, editable = true, onSave }: MarkSheetProps) {
  const [data, setData] = useState<MarkEntry[]>(entries);

  const updateMark = (id: string, obtained: number, total: number) => {
    setData((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, obtainedMarks: obtained, percentage: Math.round((obtained / total) * 100), grade: obtained >= total * 0.8 ? "A" : obtained >= total * 0.6 ? "B" : obtained >= total * 0.4 ? "C" : "D" }
          : e
      )
    );
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Total Marks</TableHead>
                <TableHead>Obtained</TableHead>
                <TableHead>%</TableHead>
                <TableHead>Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.studentName}</TableCell>
                  <TableCell>{entry.totalMarks}</TableCell>
                  <TableCell>
                    {editable ? (
                      <Input
                        type="number"
                        value={entry.obtainedMarks}
                        onChange={(e) => updateMark(entry.id, parseInt(e.target.value) || 0, entry.totalMarks)}
                        className="w-20 h-8"
                        min={0}
                        max={entry.totalMarks}
                      />
                    ) : (
                      entry.obtainedMarks
                    )}
                  </TableCell>
                  <TableCell>{entry.percentage}%</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${entry.grade.startsWith("A") ? "bg-green-100 text-green-700" : entry.grade.startsWith("B") ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {entry.grade}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {editable && onSave && (
          <div className="p-4 border-t">
            <Button onClick={() => onSave(data)}><Save className="h-4 w-4 mr-2" /> Save Marks</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
