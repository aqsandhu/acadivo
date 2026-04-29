"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Wallet, Plus, Save, AlertTriangle } from "lucide-react";
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
import { useMockApi, getFeeStructures, getFeeRecords, createFeeStructure, type FeeStructure } from "@/services/apiClient";
import { useToast } from "@/hooks/useToast";
import { Toaster } from "@/components/ui/toast";

export default function AdminFeePage() {
  const { t } = useTranslation();
  const { toasts, addToast, removeToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<FeeStructure>>({});

  const { data: structures, loading: structLoading } = useMockApi(getFeeStructures);
  const { data: records, loading: recLoading } = useMockApi(getFeeRecords);

  const handleAdd = async () => {
    try {
      await createFeeStructure(form);
      addToast({ title: "Success", description: "Fee structure created", variant: "success" });
      setModalOpen(false);
      setForm({});
    } catch {
      addToast({ title: "Error", description: "Failed to create", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Toaster toasts={toasts} removeToast={removeToast} />
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{t("nav.fee")}</h2>
        <Button size="sm" onClick={() => { setForm({}); setModalOpen(true); }}><Plus className="mr-2 h-4 w-4" />Fee Structure</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Fee Structures</CardTitle></CardHeader>
        <CardContent className="p-0">
          {structLoading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Type</TableHead><TableHead>Amount (PKR)</TableHead><TableHead>Frequency</TableHead><TableHead>Due Day</TableHead><TableHead>Late Fee</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {structures?.map((fs) => (
                    <TableRow key={fs.id}>
                      <TableCell className="font-medium">{fs.type}</TableCell>
                      <TableCell>PKR {fs.amount.toLocaleString()}</TableCell>
                      <TableCell>{fs.frequency}</TableCell>
                      <TableCell>{fs.dueDay}</TableCell>
                      <TableCell>PKR {fs.lateFee}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Fee Records</CardTitle><Badge variant="destructive">{records?.filter((r) => r.status !== "PAID").length || 0} Defaulters</Badge></CardHeader>
        <CardContent className="p-0">
          {recLoading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Student</TableHead><TableHead>Amount</TableHead><TableHead>Paid</TableHead><TableHead>Due</TableHead><TableHead>Status</TableHead><TableHead>Month</TableHead><TableHead>Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {records?.slice(0, 10).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.studentName}</TableCell>
                      <TableCell>PKR {r.amount}</TableCell>
                      <TableCell>PKR {r.paid}</TableCell>
                      <TableCell>PKR {r.due}</TableCell>
                      <TableCell><Badge variant={r.status === "PAID" ? "default" : r.status === "PARTIAL" ? "secondary" : "destructive"}>{r.status}</Badge></TableCell>
                      <TableCell>{r.month}</TableCell>
                      <TableCell><Button size="sm" variant="outline"><Save className="mr-1 h-4 w-4" />Record</Button></TableCell>
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
          <DialogHeader><DialogTitle>Create Fee Structure</DialogTitle><DialogDescription>Configure fee details.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Type</Label><Input value={form.type || ""} onChange={(e) => setForm({ ...form, type: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Amount (PKR)</Label><Input type="number" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></div>
            <div className="grid gap-2"><Label>Frequency</Label>
              <Select value={form.frequency || ""} onChange={(e) => setForm({ ...form, frequency: e.target.value as any })}>
                <SelectOption value="">Select</SelectOption>
                <SelectOption value="MONTHLY">Monthly</SelectOption>
                <SelectOption value="QUARTERLY">Quarterly</SelectOption>
                <SelectOption value="ANNUALLY">Annually</SelectOption>
              </Select>
            </div>
            <div className="grid gap-2"><Label>Due Day</Label><Input type="number" value={form.dueDay || ""} onChange={(e) => setForm({ ...form, dueDay: Number(e.target.value) })} /></div>
            <div className="grid gap-2"><Label>Late Fee (PKR)</Label><Input type="number" value={form.lateFee || ""} onChange={(e) => setForm({ ...form, lateFee: Number(e.target.value) })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setModalOpen(false); setForm({}); }}>{t("common.cancel")}</Button><Button onClick={handleAdd}>{t("common.save")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
