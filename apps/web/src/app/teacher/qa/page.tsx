"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { answerQuestion, getQAItems } from "@/services/apiClient";
import { useToast } from "@/hooks/useToast";
import { Toaster } from "@/components/ui/toast";
import type { QAItem } from "@/types";
import { HelpCircle, CheckCircle2, Globe, Loader2 } from "lucide-react";

export default function TeacherQAPage() {
  const { t } = useTranslation();
  const { toasts, addToast, removeToast } = useToast();
  const [items, setItems] = useState<QAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<QAItem | null>(null);
  const [answer, setAnswer] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getQAItems().then((q) => { setItems(q); setLoading(false); });
  }, []);

  const submitAnswer = async () => {
    if (!selected) return;
    if (!answer.trim()) {
      addToast({ title: t("common.error"), description: t("qa.answerRequired"), variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await answerQuestion(selected.id, answer, isPublic);
      addToast({ title: t("common.success"), description: t("qa.answerSubmitted"), variant: "success" });
      setSelected(null);
      setAnswer("");
      setIsPublic(false);
      const refreshed = await getQAItems();
      setItems(refreshed);
    } catch (e: any) {
      addToast({ title: t("common.error"), description: e?.response?.data?.error || t("qa.answerFailed"), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <TeacherSidebar />
      <DashboardLayout>
        <Toaster toasts={toasts} removeToast={removeToast} />
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">{t("qa.qaWithStudents")}</h1>
          {loading ? (
            <div className="space-y-3">
              {[1,2].map(i => <Skeleton key={i} className="h-32" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">{t("qa.pendingQuestions")}</h2>
                {items.filter((q) => q.status === "pending").map((q) => (
                  <Card key={q.id} className="cursor-pointer hover:shadow-md" onClick={() => { setSelected(q); setAnswer(""); }}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{q.studentName}</p>
                        <Badge variant="secondary">{q.subject}</Badge>
                      </div>
                      <p className="text-sm mt-2">{q.question}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(q.createdAt).toLocaleDateString()}</p>
                    </CardContent>
                  </Card>
                ))}
                <h2 className="text-lg font-semibold mt-4">{t("qa.answeredPublic")}</h2>
                {items.filter((q) => q.isPublic && q.status === "answered").map((q) => (
                  <Card key={q.id} className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        <p className="font-medium">{q.question}</p>
                      </div>
                      <p className="text-sm mt-2 text-muted-foreground">{q.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div>
                {selected && (
                  <Card>
                    <CardContent className="p-5 space-y-4">
                      <h3 className="font-semibold">{t("qa.answerQuestion")}</h3>
                      <div className="bg-muted p-3 rounded-md text-sm"><strong>{t("qa.question")}:</strong> {selected.question}</div>
                      <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder={t("qa.writeYourAnswer")} rows={5} />
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="rounded border-input" />
                        {t("qa.makePublic")}
                      </label>
                      <Button onClick={submitAnswer} className="w-full" disabled={submitting}>
                        {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                        {t("qa.submitAnswer")}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
