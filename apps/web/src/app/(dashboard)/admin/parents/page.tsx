"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, UserCircle, Plus, Edit, Trash2, MessageSquare, Upload, Download } from "lucide-react";
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
import { useMockApi, getParents, createParent, updateParent, deleteParent, type Parent } from "@/services/apiClient";
import { useToast } from "@/hooks/useToast";
import { Toaster } from "@/components/ui/toast";

export default function AdminParentsPage() {
  const { t } = useTranslation();
  const { toasts, addToast, removeToast } = useToast();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editParent, setEditParent] = useState<Parent | null>(null);
  const [form, setForm] = useState<Partial<Parent>>({});

  const { data: parents, loading, refetch } = useMockApi(() => getParents({ search: search || undefined }));

  const handleSave = async () => {
    try {
      if (editParent) {
        await updateParent(editParent.id, form);
        addToast({ title: "Success", description: "Parent updated", variant: "success" });
      } else {
        await createParent(form);
        addToast({ title: "Success", description: "Parent added", variant: "success" });
      }
      setModalOpen(false);
      setEditParent(null);
      setForm({});
      refetch();
    } catch {
      addToast({ title: "Error", description: "Failed to save", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteParent(id);
      addToast({ title: "Success", description: "Parent deleted", variant: "success" });
      refetch();
    } catch {
      addToast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Toaster toasts={toasts} removeToast={removeToast} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{t("nav.parents")}</h2>
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
          ) : !parents?.length ? (
            <div className="py-12 text-center text-muted-foreground">{t("common.noData")}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Unique ID</TableHead><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Children</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {parents.map((parent) => (
                    <TableRow key={parent.id}>
                      <TableCell className="font-medium">{parent.uniqueId}</TableCell>
                      <TableCell>{parent.name}</TableCell>
                      <TableCell>{parent.email}</TableCell>
                      <TableCell>{parent.phone}</TableCell>
                      <TableCell>{parent.children.join(", ")}</TableCell>
                      <TableCell><Badge variant={parent.status === "ACTIVE" ? "default" : "secondary"}>{parent.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon"><MessageSquare className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => { setEditParent(parent); setForm(parent); setModalOpen(true); }}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(parent.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) { setModalOpen(false); setEditParent(null); setForm({}); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editParent ? "Edit Parent" : "Add Parent"}</DialogTitle><DialogDescription>Fill parent details.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Name</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Email</Label><Input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Phone</Label><Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Children (comma separated)</Label><Input value={form.children?.join(", ") || ""} onChange={(e) => setForm({ ...form, children: e.target.value.split(",").map((s) => s.trim()) })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setModalOpen(false); setEditParent(null); setForm({}); }}>{t("common.cancel")}</Button><Button onClick={handleSave}>{t("common.save")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
