"use client";

import { cn } from "@/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Megaphone, FileText, CreditCard, ClipboardList, MessageSquare, FileBadge, Trash2, Bell } from "lucide-react";
import type { NotificationItem } from "@/types";

const typeIcons: Record<string, React.ReactNode> = {
  homework: <BookOpen className="h-4 w-4" />,
  announcement: <Megaphone className="h-4 w-4" />,
  result: <FileText className="h-4 w-4" />,
  fee: <CreditCard className="h-4 w-4" />,
  attendance: <ClipboardList className="h-4 w-4" />,
  message: <MessageSquare className="h-4 w-4" />,
  report: <FileBadge className="h-4 w-4" />,
};

interface NotificationListProps {
  notifications: NotificationItem[];
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMarkAllRead?: () => void;
}

export function NotificationList({ notifications, onMarkRead, onDelete, onMarkAllRead }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No notifications yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {onMarkAllRead && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onMarkAllRead}>Mark all as read</Button>
        </div>
      )}
      {notifications.map((n) => (
        <Card key={n.id} className={cn("overflow-hidden", !n.read && "border-l-4 border-l-primary")}>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-primary/10 p-2">{typeIcons[n.type]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{n.title}</p>
                {!n.read && <Badge variant="default" className="text-[10px] h-4">New</Badge>}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{n.body}</p>
              <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex gap-1">
              {!n.read && onMarkRead && (
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onMarkRead(n.id)}>✓</Button>
              )}
              {onDelete && (
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onDelete(n.id)}><Trash2 className="h-4 w-4" /></Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
