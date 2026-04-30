"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { HomeworkCard } from "@/components/dashboard/HomeworkCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getHomework, getSubmissions, submitHomework } from "@/services/apiClient";
import { useToast } from "@/hooks/useToast";
import { Toaster } from "@/components/ui/toast";
import type { HomeworkItem, HomeworkSubmission } from "@/types";
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function StudentHomeworkPage() {
  const { t } = useTranslation();
  const { toasts, addToast, removeToast } = useToast();
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<HomeworkItem | null>(null);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const h = await getHomework();
      setHomework(h);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!selected) {
      setContent("");
      return;
    }
    async function loadSubs() {
      try {
        const subs = await getSubmissions(selected.id);
        setSubmissions(subs);
      } catch {
        // ignore
      }
    }
    loadSubs();
  }, [selected]);

  const isLate = (due: string) => new Date(due) < new Date();

  const handleSubmit = async () => {
    if (!selected) return;
    if (!content.trim()) {
      addToast({ title: t("common.error"), description: t("academic.homeworkContentRequired"), variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await submitHomework(selected.id, { content });
      addToast({ title: t("common.success"), description: t("academic.homeworkSubmitted"), variant: "success" });
      setSelected(null);
      setContent("");
      const refreshed = await getHomework();
      setHomework(refreshed);
    } catch (e: any) {
      addToast({ title: t("common.error"), description: e?.response?.data?.error || t("academic.homeworkSubmitFailed"), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <StudentSidebar />
      <DashboardLayout>
        <Toaster toasts={toasts} removeToast={removeToast} />
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">{t("academic.homework")}</h1>
          <div>
            <h2 className="text-lg font-semibold mb-3">{t("academic.homeworkPending")}</h2>
            {loading ? (
              <div className="space-y-3"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {homework.map((h) => (
                  <div key={h.id}>
                    <HomeworkCard homework={h} role="student" />
                    <Button size="sm" className="mt-2" onClick={() => setSelected(h)}>{t("common.submit")}</Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3">{t("academic.homeworkSubmitted")}</h2>
            {loading ? <Skeleton className="h-40" /> : (
              <div className="space-y-2">
                {submissions.map((s) => (
                  <Card key={s.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{s.studentName}</p>
                        <p className="text-sm text-muted-foreground">{t("academic.submitted")} {formatDistanceToNow(new Date(s.submittedAt || Date.now()), { addSuffix: true })}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={s.status === "submitted" ? "default" : "destructive"}>{s.status}</Badge>
                        {s.marks !== undefined && <span className="text-sm font-medium">{s.marks} / {selected?.maxMarks ?? 20}</span>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {selected && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <Card className="w-full max-w-lg">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{t("academic.homeworkSubmit")}: {selected.title}</h3>
                    <Button size="icon" variant="ghost" onClick={() => setSelected(null)} disabled={submitting}><X className="h-4 w-4" /></Button>
                  </div>
                  {isLate(selected.dueDate) && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded-md text-sm">
                      <AlertCircle className="h-4 w-4" /> {t("academic.lateSubmission")}
                    </div>
                  )}
                  <Textarea rows={4} placeholder={t("academic.homeworkWriteAnswer")} value={content} onChange={(e) => setContent(e.target.value)} />
                  <Button variant="outline" disabled><Upload className="h-4 w-4 mr-2" /> {t("common.upload")}</Button>
                  <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                    {t("academic.homeworkSubmit")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
