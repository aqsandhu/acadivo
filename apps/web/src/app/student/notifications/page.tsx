"use client";

import { useEffect, useState } from "react";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { NotificationList } from "@/components/dashboard/NotificationList";
import { Button } from "@/components/ui/button";
import { deleteNotification, getNotifications, markNotificationRead } from "@/services/apiClient";
import type { NotificationItem } from "@/types";

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    getNotifications().then((n) => setNotifications(n));
  }, []);

  const markRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAll = async () => {
    await Promise.all(notifications.map((n) => markNotificationRead(n.id)));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotif = async (id: string) => {
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <>
      <StudentSidebar />
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">My Notifications</h1>
            <Button variant="outline" onClick={markAll}>Mark All as Read</Button>
          </div>
          <NotificationList notifications={notifications} onMarkRead={markRead} onDelete={deleteNotif} onMarkAllRead={markAll} />
        </div>
      </DashboardLayout>
    </>
  );
}
