"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ParentSidebar } from "@/components/layout/ParentSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { askQuestion, getChildren, getQAItems } from "@/services/apiClient";
import { useToast } from "@/hooks/useToast";
import { Toaster } from "@/components/ui/toast";
import type { QAItem, ChildProfile } from "@/types";
import { HelpCircle, MessageCircle } from "lucide-react";

export default function ParentQAPage() {
  const { t } = useTranslation();
  const { toasts, addToast, removeToast } = useToast();
  const [items, setItems] = useState<QAItem[]>([]);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [q, c] = await Promise.all([getQAItems(), getChildren()]);
      setItems(q);
      setChildren(c);
      if (c.length > 0) setSelectedChild(c[0].id);
      setLoading(false);
    }
    load();
  }, []);

  const ask = async () => {
    if (!question.trim()) {
      addToast({ title: t("common.error"), description: t("qa.questionRequired"), variant: "destructive" });
      return;
    }
    try {
      await askQuestion({ question, studentId: selectedChild, studentName: children.find((c) => c.id === selectedChild)?.name || "" });
      addToast({ title: t("common.success"), description: t("qa.questionSent"), variant: "success" });
      setQuestion("");
      const refreshed = await getQAItems();
      setItems(refreshed);
    } catch (e: any) {
      addToast({ title: t("common.error"), description: e?.response?.data?.error || t("qa.questionFailed"), variant: "destructive" });
    }
  };

  return (
    <>
      <ParentSidebar />
      <DashboardLayout>
        <Toaster toasts={toasts} removeToast={removeToast} />
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">{t("qa.askTeacher")}</h1>
          <Card>
            <CardContent className="p-5 space-y-4">
              <div>
                <Label>{t("parent.selectChild")}</Label>
                <Select value={selectedChild} onValueChange={(value) => setSelectedChild(value)}>
                  {children.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </Select>
              </div>
              <div>
                <Label>{t("navigation.teacher")}</Label>
                <Select>
                  <SelectItem value="">{t("qa.selectTeacher")}</SelectItem>
                  {items.filter((i) => i.teacherId && i.teacherName)
                    .map((i) => ({ id: i.teacherId!, name: i.teacherName! }))
                    .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
                    .map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </Select>
              </div>
              <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={t("qa.typeYourQuestion")} rows={3} />
              <Button onClick={ask}><HelpCircle className="h-4 w-4 mr-2" /> {t("qa.sendQuestion")}</Button>
            </CardContent>
          </Card>

          <h2 className="text-lg font-semibold">{t("qa.history")}</h2>
          {loading ? <div className="space-y-3"><Skeleton className="h-32" /><Skeleton className="h-32" /></div> : (
            <div className="space-y-3">
              {items.map((q) => (
                <Card key={q.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-primary" />
                      <p className="font-medium">{q.question}</p>
                    </div>
                    {q.answer && (
                      <div className="mt-2 bg-muted/50 p-3 rounded-md text-sm">
                        <p className="text-muted-foreground">{t("qa.answerFrom")} {q.teacherName}:</p>
                        <p>{q.answer}</p>
                      </div>
                    )}
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
