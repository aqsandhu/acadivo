"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Megaphone, Plus, Edit, Trash2, Eye, ToggleLeft, ToggleRight } from "lucide-react";
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
import { useMockApi, getAdvertisements, createAdvertisement, updateAdvertisement, deleteAdvertisement, type Advertisement } from "@/services/apiClient";
import { useToast } from "@/hooks/useToast";
import { Toaster } from "@/components/ui/toast";

export default function AdvertisementsPage() {
  const { t } = useTranslation();
  const { toasts, addToast, removeToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editAd, setEditAd] = useState<Advertisement | null>(null);
  const [form, setForm] = useState<Partial<Advertisement>>({});

  const { data: ads, loading, refetch } = useMockApi(getAdvertisements);

  const handleSave = async () => {
    try {
      if (editAd) {
        await updateAdvertisement(editAd.id, form);
        addToast({ title: "Success", description: "Ad updated", variant: "success" });
      } else {
        await createAdvertisement(form);
        addToast({ title: "Success", description: "Ad created", variant: "success" });
      }
      setModalOpen(false);
      setEditAd(null);
      setForm({});
      refetch();
    } catch {
      addToast({ title: "Error", description: "Failed to save", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAdvertisement(id);
      addToast({ title: "Success", description: "Ad deleted", variant: "success" });
      refetch();
    } catch {
      addToast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const toggleStatus = async (ad: Advertisement) => {
    try {
      await updateAdvertisement(ad.id, { status: ad.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" });
      addToast({ title: "Success", description: "Status updated", variant: "success" });
      refetch();
    } catch {
      addToast({ title: "Error", description: "Failed to toggle", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Toaster toasts={toasts} removeToast={removeToast} />
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{t("nav.advertisements")}</h2>
        <Button size="sm" onClick={() => { setForm({}); setModalOpen(true); }}><Plus className="mr-2 h-4 w-4" />Create Ad</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : !ads?.length ? (
            <div className="py-12 text-center text-muted-foreground">{t("common.noData")}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Impressions</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>CTR</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ads.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell className="font-medium">{ad.title}</TableCell>
                      <TableCell>{ad.targetAudience.join(", ")}</TableCell>
                      <TableCell>{ad.impressions.toLocaleString()}</TableCell>
                      <TableCell>{ad.clicks.toLocaleString()}</TableCell>
                      <TableCell>{((ad.clicks / ad.impressions) * 100).toFixed(2)}%</TableCell>
                      <TableCell><Badge variant={ad.status === "ACTIVE" ? "default" : "secondary"}>{ad.status}</Badge></TableCell>
                      <TableCell>{ad.priority}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => toggleStatus(ad)}>
                            {ad.status === "ACTIVE" ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => { setEditAd(ad); setForm(ad); setModalOpen(true); }}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(ad.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) { setModalOpen(false); setEditAd(null); setForm({}); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editAd ? "Edit Ad" : "Create Ad"}</DialogTitle><DialogDescription>Configure advertisement details.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Title</Label><Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Description</Label><Input value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Target Cities</Label><Input value={form.targetCities?.join(", ") || ""} onChange={(e) => setForm({ ...form, targetCities: e.target.value.split(",").map((s) => s.trim()) })} /></div>
            <div className="grid gap-2"><Label>School Types</Label><Input value={form.targetSchoolTypes?.join(", ") || ""} onChange={(e) => setForm({ ...form, targetSchoolTypes: e.target.value.split(",").map((s) => s.trim()) })} /></div>
            <div className="grid gap-2"><Label>Priority</Label>
              <Select value={String(form.priority || 1)} onValueChange={(value) => setForm({ ...form, priority: Number(value) })}>
                <SelectOption value="1">1 - Low</SelectOption><SelectOption value="2">2</SelectOption><SelectOption value="3">3</SelectOption><SelectOption value="4">4</SelectOption><SelectOption value="5">5 - High</SelectOption>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setModalOpen(false); setEditAd(null); setForm({}); }}>{t("common.cancel")}</Button><Button onClick={handleSave}>{t("common.save")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
