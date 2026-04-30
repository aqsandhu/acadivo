"use client";

import { useEffect, useState } from "react";
import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { NotificationList } from "@/components/dashboard/NotificationList";
import { getNotifications, sendNotification } from "@/services/apiClient";
import type { NotificationItem } from "@/types";
import { Send } from "lucide-react";

export default function TeacherNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState("class_students");

  useEffect(() => {
    getNotifications().then((n) => setNotifications(n));
  }, []);

  const send = async () => {
    if (!title.trim() || !body.trim()) {
      alert("Please fill in both title and body");
      return;
    }
    try {
      await sendNotification({
        title,
        body,
        target: target,
      });
      alert("Notification sent!");
      setTitle("");
      setBody("");
      const updated = await getNotifications();
      setNotifications(updated);
    } catch {
      alert("Failed to send notification");
    }
  };

  return (
    <>
      <TeacherSidebar />
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Send Notifications</h1>
          <Card>
            <CardContent className="p-5 space-y-4">
              <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
              <div><Label>Body</Label><Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} /></div>
              <div><Label>Target</Label>
                <Select value={target} onValueChange={(value) => setTarget(value)}>
                  <SelectItem value="class_students">My Class Students</SelectItem>
                  <SelectItem value="class_parents">My Class Parents</SelectItem>
                  <SelectItem value="specific_student">Specific Student</SelectItem>
                  <SelectItem value="specific_parent">Specific Parent</SelectItem>
                </Select>
              </div>
              <Button onClick={send}><Send className="h-4 w-4 mr-2" /> Send Notification</Button>
            </CardContent>
          </Card>
          <h2 className="text-lg font-semibold">History</h2>
          <NotificationList notifications={notifications} />
        </div>
      </DashboardLayout>
    </>
  );
}
