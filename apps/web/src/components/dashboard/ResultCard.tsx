"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, BookOpen } from "lucide-react";
import type { ResultItem } from "@/types";

interface ResultCardProps {
  result: ResultItem;
}

export function ResultCard({ result }: ResultCardProps) {
  const gradeColor = result.grade.startsWith("A") ? "bg-green-500/10 text-green-700" : result.grade.startsWith("B") ? "bg-blue-500/10 text-blue-700" : "bg-yellow-500/10 text-yellow-700";

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{result.term}</h3>
            <p className="text-sm text-muted-foreground">Rank #{result.rank}</p>
          </div>
          <Badge className={gradeColor}>{result.grade}</Badge>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <Trophy className="h-5 w-5 mx-auto text-yellow-500" />
            <p className="mt-1 text-lg font-bold">{result.obtainedMarks}</p>
            <p className="text-xs text-muted-foreground">Obtained</p>
          </div>
          <div className="text-center">
            <BookOpen className="h-5 w-5 mx-auto text-primary" />
            <p className="mt-1 text-lg font-bold">{result.totalMarks}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-green-500" />
            <p className="mt-1 text-lg font-bold">{result.percentage}%</p>
            <p className="text-xs text-muted-foreground">Percentage</p>
          </div>
        </div>
        <div className="mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-1">Subject</th>
                <th className="text-right py-1">Marks</th>
                <th className="text-right py-1">Grade</th>
              </tr>
            </thead>
            <tbody>
              {result.subjects.map((s) => (
                <tr key={s.subject} className="border-b last:border-0">
                  <td className="py-1">{s.subject}</td>
                  <td className="text-right py-1">{s.obtainedMarks}/{s.totalMarks}</td>
                  <td className="text-right py-1">
                    <Badge variant="outline" className="text-[10px] h-5">{s.grade}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
