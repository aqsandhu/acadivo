"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell, Plus, Trash2, Pin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectOption } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useMockApi, getAnnouncements, createAnnouncement, deleteAnnouncement, type Announcement } from "@/services/mockApi";
import { useToast } from "@/hooks/useToast";
import { Toaster } from "@/components/ui/toast";

export default function AnnouncementsPage() {
  const { t } = useTranslation();
  const { toasts, addToast, removeToast } = useToast();
  const [form, setForm] = useState<Partial<Announcement>>({ priority: "MEDIUM", targetAudience: ["ALL"] });

  const { data: announcements, loading, refetch } = useMockApi(getAnnouncements);

  const handleCreate = async () => {
    try {
      await createAnnouncement(form);
      addToast({ title: "Success", description: "Announcement posted", variant: "success" });
      setForm({ priority: "MEDIUM", targetAudience: ["ALL"] });
      refetch();
    } catch {
      addToast({ title: "Error", description: "Failed to post", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAnnouncement(id);
      addToast({ title: "Success", description: "Deleted", variant: "success" });
      refetch();
    } catch {
      addToast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Toaster toasts={toasts} removeToast={removeToast} />
      <h2 className="text-2xl font-bold tracking-tight">{t("nav.announcements")}</h2>

      <Card>
        <CardHeader><CardTitle>Create Announcement</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2"><Label>Title</Label><Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="grid gap-2"><Label>Content</Label><Input value={form.content || ""} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2"><Label>Target Audience</Label>
              <Select value={form.targetAudience?.[0] || "ALL"} onChange={(e) => setForm({ ...form, targetAudience: [e.target.value] })}>
                <SelectOption value="ALL">All</SelectOption>
                <SelectOption value="TEACHERS">Teachers</SelectOption>
                <SelectOption value="STUDENTS">Students</SelectOption>
                <SelectOption value="PARENTS">Parents</SelectOption>
              </Select>
            </div>
            <div className="grid gap-2"><Label>Priority</Label>
              <Select value={form.priority || "MEDIUM"} onChange={(e) => setForm({ ...form, priority: e.target.value as any })}>
                <SelectOption value="LOW">Low</SelectOption>
                <SelectOption value="MEDIUM">Medium</SelectOption>
                <SelectOption value="HIGH">High</SelectOption>
              </Select>
            </div>
          </div>
          <Button onClick={handleCreate}><Plus className="mr-2 h-4 w-4" />Post Announcement</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>History</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : !announcements?.length ? (
            <div className="py-12 text-center text-muted-foreground">{t("common.noData")}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Title</TableHead><TableHead>Target</TableHead><TableHead>Priority</TableHead><TableHead>Pinned</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.title}</TableCell>
                      <TableCell>{a.targetAudience.join(", ")}</TableCell>
                      <TableCell><Badge variant={a.priority === "HIGH" ? "destructive" : a.priority === "MEDIUM" ? "default" : "secondary"}>{a.priority}</Badge></TableCell>
                      <TableCell>{a.pinned && <Pin className="h-4 w-4 text-primary" />}</TableCell>
                      <TableCell>{new Date(a.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
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
