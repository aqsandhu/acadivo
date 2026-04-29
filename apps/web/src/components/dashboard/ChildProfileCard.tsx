"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GraduationCap, Hash, BookOpen, CreditCard, TrendingUp } from "lucide-react";
import type { ChildProfile } from "@/types";
import { cn } from "@/utils/cn";

const feeStatusColors = {
  paid: "bg-green-500/10 text-green-700",
  unpaid: "bg-red-500/10 text-red-700",
  partial: "bg-yellow-500/10 text-yellow-700",
};

interface ChildProfileCardProps {
  child: ChildProfile;
}

export function ChildProfileCard({ child }: ChildProfileCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-primary/10 text-primary text-lg">{child.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">{child.name}</h3>
            <p className="text-sm text-muted-foreground">Class {child.className} Section {child.section}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Hash className="h-3 w-3" /> Roll #{child.rollNumber}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Attendance</p>
              <p className="font-medium text-sm">{child.attendancePercentage}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
            <BookOpen className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Homework</p>
              <p className="font-medium text-sm">{child.pendingHomework} pending</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
            <CreditCard className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-xs text-muted-foreground">Fee</p>
              <Badge variant="outline" className={cn("text-[10px] h-4 px-1.5", feeStatusColors[child.feeStatus])}>{child.feeStatus}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
