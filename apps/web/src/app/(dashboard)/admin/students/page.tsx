"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Users, Plus, Edit, Trash2, Upload, Download, Eye, ArrowRightLeft } from "lucide-react";
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
import { useMockApi, getStudents, createStudent, updateStudent, deleteStudent, type Student } from "@/services/mockApi";
import { useToast } from "@/hooks/useToast";
import { Toaster } from "@/components/ui/toast";

export default function AdminStudentsPage() {
  const { t } = useTranslation();
  const { toasts, addToast, removeToast } = useToast();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [form, setForm] = useState<Partial<Student>>({});

  const { data: students, loading, refetch } = useMockApi(() =>
    getStudents({ search: search || undefined, class: classFilter || undefined, section: sectionFilter || undefined })
  );

  const handleSave = async () => {
    try {
      if (editStudent) {
        await updateStudent(editStudent.id, form);
        addToast({ title: "Success", description: "Student updated", variant: "success" });
      } else {
        await createStudent(form);
        addToast({ title: "Success", description: "Student added", variant: "success" });
      }
      setModalOpen(false);
      setEditStudent(null);
      setForm({});
      refetch();
    } catch {
      addToast({ title: "Error", description: "Failed to save", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStudent(id);
      addToast({ title: "Success", description: "Student deleted", variant: "success" });
      refetch();
    } catch {
      addToast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Toaster toasts={toasts} removeToast={removeToast} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{t("nav.students")}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Upload className="mr-2 h-4 w-4" />{t("common.bulkImport")}</Button>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />{t("common.export")}</Button>
          <Button size="sm" onClick={() => { setForm({}); setModalOpen(true); }}><Plus className="mr-2 h-4 w-4" />{t("common.add")}</Button>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-wrap gap-4 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("common.search")} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <SelectOption value="">All Classes</SelectOption>
            {Array.from({ length: 10 }).map((_, i) => <SelectOption key={i} value={`Class ${i + 1}`}>Class {i + 1}</SelectOption>)}
          </Select>
          <Select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
            <SelectOption value="">All Sections</SelectOption>
            <SelectOption value="A">A</SelectOption>
            <SelectOption value="B">B</SelectOption>
            <SelectOption value="C">C</SelectOption>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : !students?.length ? (
            <div className="py-12 text-center text-muted-foreground">{t("common.noData")}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Unique ID</TableHead><TableHead>Name</TableHead><TableHead>Class</TableHead><TableHead>Section</TableHead><TableHead>Roll #</TableHead><TableHead>Parent</TableHead><TableHead>Attendance</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.uniqueId}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell>{student.section}</TableCell>
                      <TableCell>{student.rollNumber}</TableCell>
                      <TableCell>{student.parentName}</TableCell>
                      <TableCell>{student.attendancePercent}%</TableCell>
                      <TableCell><Badge variant={student.status === "ACTIVE" ? "default" : "secondary"}>{student.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setEditStudent(student); setForm(student); setModalOpen(true); }}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon"><ArrowRightLeft className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) { setModalOpen(false); setEditStudent(null); setForm({}); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editStudent ? "Edit Student" : "Add Student"}</DialogTitle><DialogDescription>Fill student details.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Name</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Class</Label><Input value={form.class || ""} onChange={(e) => setForm({ ...form, class: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Section</Label><Input value={form.section || ""} onChange={(e) => setForm({ ...form, section: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Roll Number</Label><Input value={form.rollNumber || ""} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Parent Name</Label><Input value={form.parentName || ""} onChange={(e) => setForm({ ...form, parentName: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Parent Phone</Label><Input value={form.parentPhone || ""} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setModalOpen(false); setEditStudent(null); setForm({}); }}>{t("common.cancel")}</Button><Button onClick={handleSave}>{t("common.save")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
