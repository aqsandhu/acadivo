"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, FileText } from "lucide-react";
import type { HomeworkItem } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface HomeworkCardProps {
  homework: HomeworkItem;
  role?: "teacher" | "student";
}

export function HomeworkCard({ homework, role = "teacher" }: HomeworkCardProps) {
  const dueDate = new Date(homework.dueDate);
  const isLate = dueDate < new Date();

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{homework.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {homework.className} {homework.section} • {homework.subject}
            </p>
          </div>
          <Badge variant={isLate ? "destructive" : homework.status === "published" ? "default" : "secondary"}>
            {isLate ? "Late" : homework.status}
          </Badge>
        </div>
        <p className="text-sm mt-3 line-clamp-2">{homework.description}</p>
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Due: {dueDate.toLocaleDateString()}</span>
          {role === "teacher" && (
            <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {homework.submissionsCount}/{homework.totalStudents}</span>
          )}
          <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> {homework.maxMarks} marks</span>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {formatDistanceToNow(dueDate, { addSuffix: true })}
        </div>
      </CardContent>
    </Card>
  );
}
