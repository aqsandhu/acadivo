"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Clock, BookOpen, ClipboardList, FileText, BarChart3 } from "lucide-react";
import type { ClassItem } from "@/types";
import { useTranslation } from "react-i18next";

interface ClassCardProps {
  classItem: ClassItem;
}

export function ClassCard({ classItem }: ClassCardProps) {
  const { t } = useTranslation();
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">
              {classItem.className} {t("common.section")} {classItem.section}
            </h3>
            <p className="text-sm text-muted-foreground">{classItem.subject}</p>
            <p className="text-xs text-muted-foreground mt-1">{classItem.subjectUrdu}</p>
          </div>
          <Badge variant="secondary">{classItem.room}</Badge>
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {classItem.studentCount}</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {classItem.time}</span>
          <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {classItem.day}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" variant="outline"><ClipboardList className="h-3.5 w-3.5 mr-1" /> {t("common.attendance")}</Button>
          <Button size="sm" variant="outline"><FileText className="h-3.5 w-3.5 mr-1" /> {t("common.homework")}</Button>
          <Button size="sm" variant="outline"><BarChart3 className="h-3.5 w-3.5 mr-1" /> {t("common.marks")}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
