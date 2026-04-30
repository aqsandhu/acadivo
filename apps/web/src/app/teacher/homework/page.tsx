"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { HomeworkCard } from "@/components/dashboard/HomeworkCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getHomework, getSubmissions, createHomework } from "@/services/apiClient";
import { useToast } from "@/hooks/useToast";
import { Toaster } from "@/components/ui/toast";
import type { HomeworkItem, HomeworkSubmission } from "@/types";
import { Plus, X, Loader2 } from "lucide-react";

export default function TeacherHomeworkPage() {
  const { t } = useTranslation();
  const { toasts, addToast, removeToast } = useToast();
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedHw, setSelectedHw] = useState<HomeworkItem | null>(null);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    className: "10th",
    section: "A",
    subject: "Mathematics",
    dueDate: "",
    maxMarks: 20,
  });

  useEffect(() => {
    getHomework().then((h) => { setHomework(h); setLoading(false); });
  }, []);

  const viewSubmissions = async (hw: HomeworkItem) => {
    setSelectedHw(hw);
    const subs = await getSubmissions(hw.id);
    setSubmissions(subs);
  };

  const handleCreate = async (status: "active" | "draft") => {
    if (!form.title.trim()) {
      addToast({ title: t("common.error"), description: t("academic.homeworkTitleRequired"), variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await createHomework({
        title: form.title,
        description: form.description,
        class: { name: form.className } as any,
        section: { name: form.section } as any,
        subject: { name: form.subject } as any,
        dueDate: form.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        maxMarks: form.maxMarks,
        status,
      });
      addToast({ title: t("common.success"), description: status === "active" ? t("academic.homeworkPublished") : t("academic.homeworkDraftSaved"), variant: "success" });
      setShowCreate(false);
      setForm({ title: "", description: "", className: "10th", section: "A", subject: "Mathematics", dueDate: "", maxMarks: 20 });
      const refreshed = await getHomework();
      setHomework(refreshed);
    } catch (e: any) {
      addToast({ title: t("common.error"), description: e?.response?.data?.error || t("academic.homeworkCreateFailed"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <TeacherSidebar />
      <DashboardLayout>
        <Toaster toasts={toasts} removeToast={removeToast} />
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{t("academic.homeworkManagement")}</h1>
            <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" /> {t("academic.homeworkAssign")}</Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2,3].map(i => <Skeleton key={i} className="h-40" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {homework.map((h) => (
                <div key={h.id} className="relative">
                  <HomeworkCard homework={h} />
                  <Button size="sm" variant="outline" className="absolute bottom-4 right-4" onClick={() => viewSubmissions(h)}>{t("common.view")} {t("academic.submissions")}</Button>
                </div>
              ))}
            </div>
          )}

          {showCreate && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{t("academic.homeworkAssign")}</h3>
                    <Button size="icon" variant="ghost" onClick={() => setShowCreate(false)} disabled={saving}><X className="h-4 w-4" /></Button>
                  </div>
                  <div><Label>{t("common.title")}</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                  <div><Label>{t("common.description")}</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>{t("academic.class")}</Label>
                      <Select value={form.className} onValueChange={(v) => setForm({ ...form, className: v })}>
                        <SelectItem value="10th">10th</SelectItem>
                        <SelectItem value="9th">9th</SelectItem>
                        <SelectItem value="8th">8th</SelectItem>
                      </Select>
                    </div>
                    <div><Label>{t("academic.section")}</Label>
                      <Select value={form.section} onValueChange={(v) => setForm({ ...form, section: v })}>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                      </Select>
                    </div>
                  </div>
                  <div><Label>{t("academic.subject")}</Label>
                    <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v })}>
                      <SelectItem value="Mathematics">{t("academic.mathematics")}</SelectItem>
                      <SelectItem value="Physics">{t("academic.physics")}</SelectItem>
                      <SelectItem value="Chemistry">{t("academic.chemistry")}</SelectItem>
                      <SelectItem value="Biology">{t("academic.biology")}</SelectItem>
                      <SelectItem value="English">{t("academic.english")}</SelectItem>
                      <SelectItem value="Urdu">{t("academic.urdu")}</SelectItem>
                    </Select>
                  </div>
                  <div><Label>{t("academic.dueDate")}</Label><input type="datetime-local" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
                  <div><Label>{t("academic.maxMarks")}</Label><Input type="number" value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: Number(e.target.value) })} /></div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleCreate("draft")} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}{t("common.saveDraft")}</Button>
                    <Button onClick={() => handleCreate("active")} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}{t("common.publish")}</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedHw && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{t("academic.submissions")}: {selectedHw.title}</h3>
                    <Button size="icon" variant="ghost" onClick={() => setSelectedHw(null)}><X className="h-4 w-4" /></Button>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50"><tr><th className="text-left p-2">{t("navigation.student")}</th><th>{t("common.status")}</th><th>{t("academic.marks")}</th><th>{t("common.actions")}</th></tr></thead>
                    <tbody>
                      {submissions.map((s) => (
                        <tr key={s.id} className="border-t">
                          <td className="p-2">{s.studentName}</td>
                          <td className="p-2 text-center">{s.status}</td>
                          <td className="p-2 text-center">{s.marks ?? "-"}</td>
                          <td className="p-2 text-center">
                            <Button size="sm" variant="outline">{t("academic.grade")}</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
