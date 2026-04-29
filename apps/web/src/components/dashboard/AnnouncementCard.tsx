"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Calendar } from "lucide-react";
import type { Announcement } from "@/types";

interface AnnouncementCardProps {
  announcement: Announcement;
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">{announcement.title}</h3>
          </div>
          <Badge variant={announcement.priority === "high" ? "destructive" : announcement.priority === "medium" ? "default" : "secondary"}>
            {announcement.priority}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{announcement.body}</p>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(announcement.createdAt).toLocaleDateString()}</span>
          <span>By {announcement.authorName}</span>
        </div>
      </CardContent>
    </Card>
  );
}
