"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Settings, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectOption } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/useToast";
import { Toaster } from "@/components/ui/toast";
import { getUserSettings, updateUserSettings } from "@/services/apiClient";

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const { toasts, addToast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [general, setGeneral] = useState({ name: "", email: "", phone: "", address: "" });
  const [academic, setAcademic] = useState({ grading: "Percentage", year: "", terms: "2" });
  const [fee, setFee] = useState({ lateFee: "", currency: "PKR" });
  const [notifications, setNotifications] = useState({ email: true, sms: true, push: false });

  useEffect(() => {
    async function load() {
      try {
        const settings = await getUserSettings();
        if (settings) {
          setGeneral(settings.general || { name: "", email: "", phone: "", address: "" });
          setAcademic(settings.academic || { grading: "Percentage", year: "", terms: "2" });
          setFee(settings.fee || { lateFee: "", currency: "PKR" });
          setNotifications(settings.notifications || { email: true, sms: true, push: false });
        }
      } catch (e: any) {
        addToast({ title: t("common.error"), description: e?.response?.data?.error || t("settings.loadFailed"), variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [t, addToast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserSettings({ general, academic, fee, notifications });
      addToast({ title: t("common.success"), description: t("settings.saved"), variant: "success" });
    } catch (e: any) {
      addToast({ title: t("common.error"), description: e?.response?.data?.error || t("settings.saveFailed"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster toasts={toasts} removeToast={removeToast} />
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{t("nav.settings")}</h2>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {t("common.saveChanges")}
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">{t("settings.general")}</TabsTrigger>
          <TabsTrigger value="academic">{t("settings.academic")}</TabsTrigger>
          <TabsTrigger value="fee">{t("fee.fee")}</TabsTrigger>
          <TabsTrigger value="notifications">{t("common.notifications")}</TabsTrigger>
          <TabsTrigger value="permissions">{t("settings.permissions")}</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>{t("settings.schoolInformation")}</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2"><Label>{t("settings.schoolName")}</Label><Input value={general.name} onChange={(e) => setGeneral({ ...general, name: e.target.value })} /></div>
              <div className="grid gap-2"><Label>{t("common.email")}</Label><Input value={general.email} onChange={(e) => setGeneral({ ...general, email: e.target.value })} /></div>
              <div className="grid gap-2"><Label>{t("common.phone")}</Label><Input value={general.phone} onChange={(e) => setGeneral({ ...general, phone: e.target.value })} /></div>
              <div className="grid gap-2"><Label>{t("common.address")}</Label><Input value={general.address} onChange={(e) => setGeneral({ ...general, address: e.target.value })} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>{t("settings.academicSettings")}</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2"><Label>{t("settings.gradingScheme")}</Label>
                <Select value={academic.grading} onValueChange={(value) => setAcademic({ ...academic, grading: value })}>
                  <SelectOption value="Percentage">{t("settings.percentage")}</SelectOption>
                  <SelectOption value="GPA">{t("settings.gpa")}</SelectOption>
                  <SelectOption value="Letter">{t("settings.letterGrades")}</SelectOption>
                </Select>
              </div>
              <div className="grid gap-2"><Label>{t("settings.academicYear")}</Label><Input value={academic.year} onChange={(e) => setAcademic({ ...academic, year: e.target.value })} /></div>
              <div className="grid gap-2"><Label>{t("settings.termsPerYear")}</Label><Input type="number" value={academic.terms} onChange={(e) => setAcademic({ ...academic, terms: e.target.value })} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fee" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>{t("settings.feeSettings")}</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2"><Label>{t("settings.defaultLateFee")}</Label><Input value={fee.lateFee} onChange={(e) => setFee({ ...fee, lateFee: e.target.value })} /></div>
              <div className="grid gap-2"><Label>{t("settings.currency")}</Label>
                <Select value={fee.currency} onValueChange={(value) => setFee({ ...fee, currency: value })}>
                  <SelectOption value="PKR">{t("settings.pkr")}</SelectOption>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>{t("settings.notificationPreferences")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><Label>{t("settings.emailNotifications")}</Label><Switch checked={notifications.email} onCheckedChange={(v) => setNotifications({ ...notifications, email: v })} /></div>
              <div className="flex items-center justify-between"><Label>{t("settings.smsNotifications")}</Label><Switch checked={notifications.sms} onCheckedChange={(v) => setNotifications({ ...notifications, sms: v })} /></div>
              <div className="flex items-center justify-between"><Label>{t("settings.pushNotifications")}</Label><Switch checked={notifications.push} onCheckedChange={(v) => setNotifications({ ...notifications, push: v })} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>{t("settings.userPermissions")}</CardTitle></CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">{t("settings.permissionsPlaceholder")}</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
