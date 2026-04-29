"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, BookOpen, Plus, Edit, Trash2, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useMockApi, getSubjects, type Subject } from "@/services/apiClient";
import { useToast } from "@/hooks/useToast";
import { Toaster } from "@/components/ui/toast";

export default function AdminSubjectsPage() {
  const { t } = useTranslation();
  const { toasts, addToast, removeToast } = useToast();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<Subject>>({});
  const { data: subjects, loading } = useMockApi(getSubjects);

  return (
    <div className="space-y-6">
      <Toaster toasts={toasts} removeToast={removeToast} />
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{t("nav.subjects")}</h2>
        <Button size="sm" onClick={() => { setForm({}); setModalOpen(true); }}><Plus className="mr-2 h-4 w-4" />Add Subject</Button>
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
          ) : !subjects?.length ? (
            <div className="py-12 text-center text-muted-foreground">{t("common.noData")}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Teachers</TableHead><TableHead>Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">{subject.code}</TableCell>
                      <TableCell>{subject.name}</TableCell>
                      <TableCell>{subject.teacherNames.map((n) => <Badge key={n} variant="secondary" className="mr-1">{n}</Badge>)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm"><GraduationCap className="mr-1 h-4 w-4" />Assign</Button>
                          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
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

      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) { setModalOpen(false); setForm({}); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Subject</DialogTitle><DialogDescription>Create a new subject.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Subject Name</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Code</Label><Input value={form.code || ""} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setModalOpen(false); setForm({}); }}>{t("common.cancel")}</Button><Button onClick={() => { addToast({ title: "Success", description: "Subject created", variant: "success" }); setModalOpen(false); }}>{t("common.save")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
