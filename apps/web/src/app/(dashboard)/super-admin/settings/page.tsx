"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Settings, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/useToast";
import { Toaster } from "@/components/ui/toast";
import { getUserSettings, updateUserSettings } from "@/services/apiClient";

export default function SuperAdminSettingsPage() {
  const { t } = useTranslation();
  const { toasts, addToast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [platform, setPlatform] = useState({ name: "", supportEmail: "", maxSchools: "100" });
  const [security, setSecurity] = useState({ twoFactor: true, forcePasswordChange: false });

  useEffect(() => {
    async function load() {
      try {
        const settings = await getUserSettings();
        if (settings) {
          setPlatform(settings.platform || { name: "", supportEmail: "", maxSchools: "100" });
          setSecurity(settings.security || { twoFactor: true, forcePasswordChange: false });
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
      await updateUserSettings({ platform, security });
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

      <Tabs defaultValue="platform">
        <TabsList>
          <TabsTrigger value="platform">{t("settings.platform")}</TabsTrigger>
          <TabsTrigger value="security">{t("settings.security")}</TabsTrigger>
          <TabsTrigger value="billing">{t("settings.billing")}</TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>{t("settings.platformSettings")}</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2"><Label>{t("settings.platformName")}</Label><Input value={platform.name} onChange={(e) => setPlatform({ ...platform, name: e.target.value })} /></div>
              <div className="grid gap-2"><Label>{t("settings.supportEmail")}</Label><Input value={platform.supportEmail} onChange={(e) => setPlatform({ ...platform, supportEmail: e.target.value })} /></div>
              <div className="grid gap-2"><Label>{t("settings.maxSchools")}</Label><Input type="number" value={platform.maxSchools} onChange={(e) => setPlatform({ ...platform, maxSchools: e.target.value })} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>{t("settings.securitySettings")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><Label>{t("settings.require2FA")}</Label><Switch checked={security.twoFactor} onCheckedChange={(v) => setSecurity({ ...security, twoFactor: v })} /></div>
              <div className="flex items-center justify-between"><Label>{t("settings.forcePasswordChange")}</Label><Switch checked={security.forcePasswordChange} onCheckedChange={(v) => setSecurity({ ...security, forcePasswordChange: v })} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>{t("settings.billingSettings")}</CardTitle></CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">{t("settings.billingPlaceholder")}</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
