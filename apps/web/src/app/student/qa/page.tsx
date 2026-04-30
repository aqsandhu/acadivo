"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { askQuestion, getQAItems } from "@/services/apiClient";
import { useToast } from "@/hooks/useToast";
import { Toaster } from "@/components/ui/toast";
import type { QAItem } from "@/types";
import { HelpCircle, Globe, CheckCircle2 } from "lucide-react";

export default function StudentQAPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [items, setItems] = useState<QAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [subject, setSubject] = useState("Mathematics");

  useEffect(() => {
    getQAItems().then((q) => { setItems(q); setLoading(false); });
  }, []);

  const ask = async () => {
    if (!question.trim()) {
      addToast({ title: t("common.error"), description: t("qa.questionRequired"), variant: "destructive" });
      return;
    }
    try {
      await askQuestion({ question, subject, studentId: user?.id || "", studentName: user?.name || "" });
      addToast({ title: t("common.success"), description: t("qa.questionSubmitted"), variant: "success" });
      setQuestion("");
      const refreshed = await getQAItems();
      setItems(refreshed);
    } catch (e: any) {
      addToast({ title: t("common.error"), description: e?.response?.data?.error || t("qa.questionFailed"), variant: "destructive" });
    }
  };

  return (
    <>
      <StudentSidebar />
      <DashboardLayout>
        <Toaster toasts={toasts} removeToast={removeToast} />
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">{t("qa.askQuestions")}</h1>
          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold">{t("qa.askNewQuestion")}</h3>
              <div>
                <label className="text-sm font-medium">{t("academic.subject")}</label>
                <Select value={subject} onValueChange={(value) => setSubject(value)}>
                  <SelectItem value="Mathematics">{t("academic.mathematics")}</SelectItem>
                  <SelectItem value="Physics">{t("academic.physics")}</SelectItem>
                  <SelectItem value="Chemistry">{t("academic.chemistry")}</SelectItem>
                  <SelectItem value="Biology">{t("academic.biology")}</SelectItem>
                  <SelectItem value="English">{t("academic.english")}</SelectItem>
                  <SelectItem value="Urdu">{t("academic.urdu")}</SelectItem>
                </Select>
              </div>
              <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={t("qa.typeYourQuestion")} rows={3} />
              <Button onClick={ask}><HelpCircle className="h-4 w-4 mr-2" /> {t("qa.askQuestion")}</Button>
            </CardContent>
          </Card>

          <h2 className="text-lg font-semibold">{t("qa.myQuestions")}</h2>
          {loading ? <div className="space-y-3"><Skeleton className="h-32" /><Skeleton className="h-32" /></div> : (
            <div className="space-y-3">
              {items.map((q) => (
                <Card key={q.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{q.subject}</Badge>
                      <Badge variant={q.status === "answered" ? "default" : "outline"}>{q.status}</Badge>
                    </div>
                    <p className="font-medium mt-2">{q.question}</p>
                    {q.answer && (
                      <div className="mt-3 bg-muted/50 p-3 rounded-md text-sm">
                        <p className="text-muted-foreground">{t("qa.answer")}:</p>
                        <p>{q.answer}</p>
                      </div>
                    )}
                    {q.isPublic && <span className="text-xs text-muted-foreground flex items-center gap-1 mt-2"><Globe className="h-3 w-3" /> {t("qa.public")}</span>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
