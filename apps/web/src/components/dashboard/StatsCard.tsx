"use client";

import { cn } from "@/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  trend?: { direction: "up" | "down"; value: string };
  className?: string;
  loading?: boolean;
}

export function StatsCard({ icon: Icon, value, label, trend, className, loading }: StatsCardProps) {
  if (loading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="mt-3 h-7 w-16" />
          <Skeleton className="mt-2 h-4 w-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {trend && (
            <p className={cn("mt-1 text-xs font-medium", trend.direction === "up" ? "text-green-600" : "text-red-600")}>
              {trend.direction === "up" ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className="rounded-full bg-primary/10 p-3">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}
