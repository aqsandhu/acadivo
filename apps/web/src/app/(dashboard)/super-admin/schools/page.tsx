"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Search, Filter, Download, Plus, Eye, Edit, Power, Trash2, X,
  School,
} from "lucide-react";
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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useMockApi, getSchools, createSchool, updateSchool, deleteSchool, type School } from "@/services/mockApi";
import { useToast } from "@/hooks/useToast";
import { Toaster } from "@/components/ui/toast";

export default function SchoolsPage() {
  const { t } = useTranslation();
  const { toasts, addToast, removeToast } = useToast();
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editSchool, setEditSchool] = useState<School | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<School>>({});

  const { data: schools, loading, refetch } = useMockApi(() =>
    getSchools({ search: search || undefined, city: cityFilter || undefined, status: statusFilter || undefined, plan: planFilter || undefined })
  );

  const handleAdd = async () => {
    try {
      await createSchool(form);
      addToast({ title: "Success", description: "School created successfully", variant: "success" });
      setModalOpen(false);
      setForm({});
      refetch();
    } catch {
      addToast({ title: "Error", description: "Failed to create school", variant: "destructive" });
    }
  };

  const handleUpdate = async () => {
    if (!editSchool) return;
    try {
      await updateSchool(editSchool.id, form);
      addToast({ title: "Success", description: "School updated", variant: "success" });
      setEditSchool(null);
      setForm({});
      refetch();
    } catch {
      addToast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSchool(id);
      addToast({ title: "Success", description: "School deleted", variant: "success" });
      setConfirmDelete(null);
      refetch();
    } catch {
      addToast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const exportCSV = () => {
    if (!schools) return;
    const headers = ["Name", "Code", "City", "Type", "Plan", "Status", "Users", "Principal"];
    const rows = schools.map((s) => [s.name, s.code, s.city, s.type, s.plan, s.status, s.userCount, s.principalName]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schools.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      <Toaster toasts={toasts} removeToast={removeToast} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{t("nav.schools")}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="mr-2 h-4 w-4" />{t("common.export")}</Button>
          <Button size="sm" onClick={() => { setForm({}); setModalOpen(true); }}><Plus className="mr-2 h-4 w-4" />{t("common.add")}</Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap gap-4 p-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t("common.search")} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <Select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
            <SelectOption value="">All Cities</SelectOption>
            <SelectOption value="Lahore">Lahore</SelectOption>
            <SelectOption value="Karachi">Karachi</SelectOption>
            <SelectOption value="Islamabad">Islamabad</SelectOption>
            <SelectOption value="Faisalabad">Faisalabad</SelectOption>
            <SelectOption value="Rawalpindi">Rawalpindi</SelectOption>
            <SelectOption value="Peshawar">Peshawar</SelectOption>
            <SelectOption value="Multan">Multan</SelectOption>
          </Select>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <SelectOption value="">All Status</SelectOption>
            <SelectOption value="ACTIVE">Active</SelectOption>
            <SelectOption value="SUSPENDED">Suspended</SelectOption>
            <SelectOption value="PENDING">Pending</SelectOption>
          </Select>
          <Select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
            <SelectOption value="">All Plans</SelectOption>
            <SelectOption value="Basic">Basic</SelectOption>
            <SelectOption value="Standard">Standard</SelectOption>
            <SelectOption value="Premium">Premium</SelectOption>
            <SelectOption value="Enterprise">Enterprise</SelectOption>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : !schools?.length ? (
            <div className="py-12 text-center text-muted-foreground">{t("common.noData")}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead className="text-right">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell className="font-medium">{school.name}</TableCell>
                      <TableCell>{school.code}</TableCell>
                      <TableCell>{school.city}</TableCell>
                      <TableCell>{school.type}</TableCell>
                      <TableCell>{school.plan}</TableCell>
                      <TableCell>
                        <Badge variant={school.status === "ACTIVE" ? "default" : school.status === "PENDING" ? "secondary" : "destructive"}>
                          {school.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{school.userCount} / {school.maxUsers}</TableCell>
                      <TableCell>{school.principalName}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => { setEditSchool(school); setForm(school); }}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(school.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen || !!editSchool} onOpenChange={(open) => { if (!open) { setModalOpen(false); setEditSchool(null); setForm({}); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editSchool ? "Edit School" : "Add School"}</DialogTitle>
            <DialogDescription>Fill in the details below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Name</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Code</Label><Input value={form.code || ""} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
            <div className="grid gap-2"><Label>City</Label><Input value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Type</Label>
              <Select value={form.type || ""} onChange={(e) => setForm({ ...form, type: e.target.value as any })}>
                <SelectOption value="">Select</SelectOption>
                <SelectOption value="GOVERNMENT">Government</SelectOption>
                <SelectOption value="PRIVATE">Private</SelectOption>
                <SelectOption value="SEMI_PRIVATE">Semi-Private</SelectOption>
              </Select>
            </div>
            <div className="grid gap-2"><Label>Plan</Label>
              <Select value={form.plan || ""} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
                <SelectOption value="">Select</SelectOption>
                <SelectOption value="Basic">Basic</SelectOption>
                <SelectOption value="Standard">Standard</SelectOption>
                <SelectOption value="Premium">Premium</SelectOption>
                <SelectOption value="Enterprise">Enterprise</SelectOption>
              </Select>
            </div>
            <div className="grid gap-2"><Label>Principal Name</Label><Input value={form.principalName || ""} onChange={(e) => setForm({ ...form, principalName: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Principal Email</Label><Input value={form.principalEmail || ""} onChange={(e) => setForm({ ...form, principalEmail: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Principal Phone</Label><Input value={form.principalPhone || ""} onChange={(e) => setForm({ ...form, principalPhone: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setModalOpen(false); setEditSchool(null); setForm({}); }}>{t("common.cancel")}</Button>
            <Button onClick={editSchool ? handleUpdate : handleAdd}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
