"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { useApi, getTeachers, createTeacher, updateTeacher, deleteTeacher, type Teacher } from "@/services/apiClient";
import { useToast } from "@/hooks/useToast";
import { Toaster } from "@/components/ui/toast";

const teacherSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  qualifications: z.string().optional(),
  subjects: z.string().optional(),
  assignedClasses: z.string().optional(),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

export default function AdminTeachersPage() {
  const { t } = useTranslation();
  const { toasts, addToast, removeToast } = useToast();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      qualifications: "",
      subjects: "",
      assignedClasses: "",
    },
  });

  const { data: teachers, loading, refetch } = useApi(() => getTeachers({ search: search || undefined }));

  const openModal = (teacher?: Teacher) => {
    if (teacher) {
      setEditTeacher(teacher);
      setValue("name", (teacher as any).name || "");
      setValue("email", (teacher as any).email || "");
      setValue("phone", (teacher as any).phone || "");
      setValue("qualifications", (teacher as any).qualifications || "");
      setValue("subjects", (teacher as any).subjects?.join(", ") || "");
      setValue("assignedClasses", (teacher as any).assignedClasses?.join(", ") || "");
    } else {
      setEditTeacher(null);
      reset();
    }
    setModalOpen(true);
  };

  const handleSave = async (data: TeacherFormData) => {
    const payload = {
      ...data,
      subjects: data.subjects ? data.subjects.split(",").map((s) => s.trim()) : [],
      assignedClasses: data.assignedClasses ? data.assignedClasses.split(",").map((s) => s.trim()) : [],
    };
    try {
      if (editTeacher) {
        await updateTeacher(editTeacher.id, payload as Partial<Teacher>);
        addToast({ title: "Success", description: "Teacher updated", variant: "success" });
      } else {
        await createTeacher(payload as Partial<Teacher>);
        addToast({ title: "Success", description: "Teacher added", variant: "success" });
      }
      setModalOpen(false);
      setEditTeacher(null);
      reset();
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
      await updateTeacher(teacher.id, { status: (teacher as any).status === "ACTIVE" ? "INACTIVE" : "ACTIVE" });
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
          <Button size="sm" onClick={() => openModal()}><Plus className="mr-2 h-4 w-4" />{t("common.add")}</Button>
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
                      <TableCell>{(teacher as any).name}</TableCell>
                      <TableCell>{(teacher as any).email}</TableCell>
                      <TableCell>{(teacher as any).phone}</TableCell>
                      <TableCell>{(teacher as any).qualifications}</TableCell>
                      <TableCell>{(teacher as any).subjects?.join(", ")}</TableCell>
                      <TableCell>{(teacher as any).assignedClasses?.join(", ")}</TableCell>
                      <TableCell><Badge variant={(teacher as any).status === "ACTIVE" ? "default" : "secondary"}>{(teacher as any).status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(teacher)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => openModal(teacher)}><Edit className="h-4 w-4" /></Button>
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

      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) { setModalOpen(false); setEditTeacher(null); reset(); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editTeacher ? "Edit Teacher" : "Add Teacher"}</DialogTitle><DialogDescription>Fill teacher details.</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit(handleSave)} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input {...register("name")} />
              {errors.name && <p className="text-xs text-danger-500">{errors.name.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-danger-500">{errors.email.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input {...register("phone")} />
            </div>
            <div className="grid gap-2">
              <Label>Qualifications</Label>
              <Input {...register("qualifications")} />
            </div>
            <div className="grid gap-2">
              <Label>Subjects (comma separated)</Label>
              <Input {...register("subjects")} />
            </div>
            <div className="grid gap-2">
              <Label>Assigned Classes (comma separated)</Label>
              <Input {...register("assignedClasses")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setModalOpen(false); setEditTeacher(null); reset(); }}>{t("common.cancel")}</Button>
              <Button type="submit">{t("common.save")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
