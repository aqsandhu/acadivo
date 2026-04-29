"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, GraduationCap, Plus, Edit, Trash2, Upload, Download, Eye } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useMockApi, getTeachers, createTeacher, updateTeacher, deleteTeacher, type Teacher } from "@/services/mockApi";
import { useToast } from "@/hooks/useToast";
import { Toaster } from "@/components/ui/toast";

export default function AdminTeachersPage() {
  const { t } = useTranslation();
  const { toasts, addToast, removeToast } = useToast();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [form, setForm] = useState<Partial<Teacher>>({});

  const { data: teachers, loading, refetch } = useMockApi(() => getTeachers({ search: search || undefined }));

  const handleSave = async () => {
    try {
      if (editTeacher) {
        await updateTeacher(editTeacher.id, form);
        addToast({ title: "Success", description: "Teacher updated", variant: "success" });
      } else {
        await createTeacher(form);
        addToast({ title: "Success", description: "Teacher added", variant: "success" });
      }
      setModalOpen(false);
      setEditTeacher(null);
      setForm({});
      refetch();
    } catch {
      addToast({ title: "Error", description: "Failed to save", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTeacher(id);
      addToast({ title: "Success", description: "Teacher deleted", variant: "success" });
      refetch();
    } catch {
      addToast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const handleToggleStatus = async (teacher: Teacher) => {
    try {
      await updateTeacher(teacher.id, { status: teacher.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" });
      addToast({ title: "Success", description: "Status updated", variant: "success" });
      refetch();
    } catch {
      addToast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Toaster toasts={toasts} removeToast={removeToast} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{t("nav.teachers")}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Upload className="mr-2 h-4 w-4" />{t("common.bulkImport")}</Button>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />{t("common.export")}</Button>
          <Button size="sm" onClick={() => { setForm({}); setModalOpen(true); }}><Plus className="mr-2 h-4 w-4" />{t("common.add")}</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("common.search")} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : !teachers?.length ? (
            <div className="py-12 text-center text-muted-foreground">{t("common.noData")}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Unique ID</TableHead><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Qualifications</TableHead><TableHead>Subjects</TableHead><TableHead>Classes</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">{teacher.uniqueId}</TableCell>
                      <TableCell>{teacher.name}</TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>{teacher.phone}</TableCell>
                      <TableCell>{teacher.qualifications}</TableCell>
                      <TableCell>{teacher.subjects.join(", ")}</TableCell>
                      <TableCell>{teacher.assignedClasses.join(", ")}</TableCell>
                      <TableCell><Badge variant={teacher.status === "ACTIVE" ? "default" : "secondary"}>{teacher.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(teacher)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => { setEditTeacher(teacher); setForm(teacher); setModalOpen(true); }}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(teacher.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) { setModalOpen(false); setEditTeacher(null); setForm({}); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editTeacher ? "Edit Teacher" : "Add Teacher"}</DialogTitle><DialogDescription>Fill teacher details.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Name</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Email</Label><Input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Phone</Label><Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Qualifications</Label><Input value={form.qualifications || ""} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Subjects (comma separated)</Label><Input value={form.subjects?.join(", ") || ""} onChange={(e) => setForm({ ...form, subjects: e.target.value.split(",").map((s) => s.trim()) })} /></div>
            <div className="grid gap-2"><Label>Assigned Classes (comma separated)</Label><Input value={form.assignedClasses?.join(", ") || ""} onChange={(e) => setForm({ ...form, assignedClasses: e.target.value.split(",").map((s) => s.trim()) })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setModalOpen(false); setEditTeacher(null); setForm({}); }}>{t("common.cancel")}</Button><Button onClick={handleSave}>{t("common.save")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
