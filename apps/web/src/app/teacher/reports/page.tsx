"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getReportRequests } from "@/services/apiClient";
import { useToast } from "@/hooks/useToast";
import { Toaster } from "@/components/ui/toast";
import type { ReportRequest } from "@/types";
import { FileBadge, Download, CheckCircle2 } from "lucide-react";

export default function TeacherReportsPage() {
  const { t } = useTranslation();
  const { toasts, addToast, removeToast } = useToast();
  const [requests, setRequests] = useState<ReportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getReportRequests().then((r) => { setRequests(r); setLoading(false); });
  }, []);

  return (
    <>
      <TeacherSidebar />
      <DashboardLayout>
        <Toaster toasts={toasts} removeToast={removeToast} />
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">{t("report.reports")}</h1>
          {loading ? (
            <div className="space-y-3">
              {[1,2].map(i => <Skeleton key={i} className="h-32" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <Card key={r.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileBadge className="h-5 w-5 text-primary" />
                        <p className="font-medium">{r.type} {t("report.report")} — {r.studentName}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{t("report.requestedBy")} {r.parentId} {t("common.on")} {new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={r.status === "completed" ? "default" : r.status === "pending" ? "secondary" : "destructive"}>{r.status}</Badge>
                      {r.status === "pending" && <Button size="sm" onClick={() => setShowForm(true)}>{t("report.generate")}</Button>}
                      {r.reportUrl && <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-1" /> PDF</Button>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {showForm && (
            <Card className="mt-4">
              <CardContent className="p-5 space-y-4">
                <h3 className="font-semibold">{t("report.generateReport")}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>{t("report.attendanceSummary")}</Label><Textarea rows={2} defaultValue={t("report.defaultAttendanceSummary")} /></div>
                  <div><Label>{t("report.subjectGrades")}</Label><Textarea rows={2} defaultValue={t("report.defaultSubjectGrades")} /></div>
                </div>
                <div>
                  <Label>{t("report.behaviorAssessment")}</Label>
                  <Select defaultValue="good">
                    <SelectItem value="excellent">{t("report.excellent")}</SelectItem>
                    <SelectItem value="good">{t("report.good")}</SelectItem>
                    <SelectItem value="satisfactory">{t("report.satisfactory")}</SelectItem>
                    <SelectItem value="needs improvement">{t("report.needsImprovement")}</SelectItem>
                  </Select>
                </div>
                <div><Label>{t("report.teacherComments")}</Label><Textarea rows={3} placeholder={t("report.enterComments")} /></div>
                <Button onClick={() => { setShowForm(false); addToast({ title: t("common.success"), description: t("report.generated"), variant: "success" }); }}><CheckCircle2 className="h-4 w-4 mr-2" /> {t("report.generatePDF")}</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
