"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Megaphone, Send, Search, Bell, Users, GraduationCap, UserCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectOption } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useApi, getNotifications, type NotificationItem } from "@/services/apiClient";
import { useToast } from "@/hooks/useToast";
import { Toaster } from "@/components/ui/toast";

export default function PrincipalNotificationsPage() {
  const { t } = useTranslation();
  const { toasts, addToast, removeToast } = useToast();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState("ALL");
  const { data: notifications, loading } = useApi(getNotifications);

  const handleSend = () => {
    addToast({ title: "Sent", description: `Notification sent to ${target}`, variant: "success" });
    setTitle("");
    setBody("");
  };

  return (
    <div className="space-y-6">
      <Toaster toasts={toasts} removeToast={removeToast} />
      <h2 className="text-2xl font-bold tracking-tight">{t("nav.notifications")}</h2>

      <Card>
        <CardHeader><CardTitle>Send Notification</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title" /></div>
          <div className="grid gap-2"><Label>Body</Label><Input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Notification body" /></div>
          <div className="grid gap-2"><Label>Target Audience</Label>
            <Select value={target} onValueChange={(value) => setTarget(value)}>
              <SelectOption value="ALL">All</SelectOption>
              <SelectOption value="TEACHERS">All Teachers</SelectOption>
              <SelectOption value="STUDENTS">All Students</SelectOption>
              <SelectOption value="PARENTS">All Parents</SelectOption>
              <SelectOption value="INDIVIDUAL">Individual</SelectOption>
            </Select>
          </div>
          {target === "INDIVIDUAL" && (
            <div className="grid gap-2"><Label>Search Recipient</Label>
              <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search by name..." /></div>
            </div>
          )}
          <div className="border rounded-md p-4 bg-muted/30">
            <div className="text-sm font-medium mb-1">Preview</div>
            <div className="text-sm">{title || "Notification Title"}</div>
            <div className="text-xs text-muted-foreground">{body || "Notification body text..."}</div>
          </div>
          <Button onClick={handleSend}><Send className="mr-2 h-4 w-4" />Send Notification</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Send History</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : !notifications?.length ? (
            <div className="py-12 text-center text-muted-foreground">{t("common.noData")}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Title</TableHead><TableHead>Body</TableHead><TableHead>Target</TableHead><TableHead>Sent At</TableHead><TableHead>Read Count</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell className="font-medium">{n.title}</TableCell>
                      <TableCell className="max-w-xs truncate">{n.body}</TableCell>
                      <TableCell><Badge variant="outline">{n.targetAudience}</Badge></TableCell>
                      <TableCell>{new Date(n.sentAt).toLocaleDateString()}</TableCell>
                      <TableCell>{n.readCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
