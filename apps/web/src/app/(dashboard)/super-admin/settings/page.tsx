"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Settings, Save, Loader2, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/useToast";
import { Toaster } from "@/components/ui/toast";
import { getSystemSettings, updateSystemSetting } from "@/services/apiClient";

export default function SuperAdminSettingsPage() {
  const { t } = useTranslation();
  const { toasts, addToast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [general, setGeneral] = useState({ platformName: "Acadivo", supportEmail: "", supportPhone: "" });
  const [security, setSecurity] = useState({ enforce2FA: false, maxLoginAttempts: "5", lockoutDuration: "30" });
  const [features, setFeatures] = useState({ enableAds: true, enableChat: true, enableQAPublic: true });

  useEffect(() => {
    async function load() {
      try {
        const settings = await getSystemSettings();
        if (settings) {
          setGeneral(settings.general || { platformName: "Acadivo", supportEmail: "", supportPhone: "" });
          setSecurity(settings.security || { enforce2FA: false, maxLoginAttempts: "5", lockoutDuration: "30" });
          setFeatures(settings.features || { enableAds: true, enableChat: true, enableQAPublic: true });
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
      await updateSystemSetting({ key: "general", value: general, category: "platform" });
      await updateSystemSetting({ key: "security", value: security, category: "platform" });
      await updateSystemSetting({ key: "features", value: features, category: "platform" });
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
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">{t("nav.settings")}</h2>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {t("common.saveChanges")}
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">{t("settings.general")}</TabsTrigger>
          <TabsTrigger value="security">{t("settings.security")}</TabsTrigger>
          <TabsTrigger value="features">{t("settings.features")}</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>{t("settings.platformInformation")}</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2"><Label>{t("settings.platformName")}</Label><Input value={general.platformName} onChange={(e) => setGeneral({ ...general, platformName: e.target.value })} /></div>
              <div className="grid gap-2"><Label>{t("settings.supportEmail")}</Label><Input type="email" value={general.supportEmail} onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })} /></div>
              <div className="grid gap-2"><Label>{t("settings.supportPhone")}</Label><Input value={general.supportPhone} onChange={(e) => setGeneral({ ...general, supportPhone: e.target.value })} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>{t("settings.securitySettings")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><Label>{t("settings.enforce2FA")}</Label><Switch checked={security.enforce2FA} onCheckedChange={(v) => setSecurity({ ...security, enforce2FA: v })} /></div>
              <div className="grid gap-2"><Label>{t("settings.maxLoginAttempts")}</Label><Input type="number" value={security.maxLoginAttempts} onChange={(e) => setSecurity({ ...security, maxLoginAttempts: e.target.value })} /></div>
              <div className="grid gap-2"><Label>{t("settings.lockoutDuration")} (minutes)</Label><Input type="number" value={security.lockoutDuration} onChange={(e) => setSecurity({ ...security, lockoutDuration: e.target.value })} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>{t("settings.featureToggles")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><Label>{t("settings.enableAds")}</Label><Switch checked={features.enableAds} onCheckedChange={(v) => setFeatures({ ...features, enableAds: v })} /></div>
              <div className="flex items-center justify-between"><Label>{t("settings.enableChat")}</Label><Switch checked={features.enableChat} onCheckedChange={(v) => setFeatures({ ...features, enableChat: v })} /></div>
              <div className="flex items-center justify-between"><Label>{t("settings.enableQAPublic")}</Label><Switch checked={features.enableQAPublic} onCheckedChange={(v) => setFeatures({ ...features, enableQAPublic: v })} /></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
