"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Settings, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/useToast";
import { Toaster } from "@/components/ui/toast";

export default function SuperAdminSettingsPage() {
  const { t } = useTranslation();
  const { toasts, addToast, removeToast } = useToast();
  const [platform, setPlatform] = useState({ name: "Acadivo", supportEmail: "support@acadivo.pk", maxSchools: "100" });
  const [security, setSecurity] = useState({ twoFactor: true, forcePasswordChange: false });

  const handleSave = () => {
    addToast({ title: "Success", description: "Settings saved", variant: "success" });
  };

  return (
    <div className="space-y-6">
      <Toaster toasts={toasts} removeToast={removeToast} />
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{t("nav.settings")}</h2>
        <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" />Save Changes</Button>
      </div>

      <Tabs defaultValue="platform">
        <TabsList>
          <TabsTrigger value="platform">Platform</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>Platform Settings</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2"><Label>Platform Name</Label><Input value={platform.name} onChange={(e) => setPlatform({ ...platform, name: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Support Email</Label><Input value={platform.supportEmail} onChange={(e) => setPlatform({ ...platform, supportEmail: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Max Schools</Label><Input type="number" value={platform.maxSchools} onChange={(e) => setPlatform({ ...platform, maxSchools: e.target.value })} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>Security Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><Label>Require 2FA for Admins</Label><Switch checked={security.twoFactor} onCheckedChange={(v) => setSecurity({ ...security, twoFactor: v })} /></div>
              <div className="flex items-center justify-between"><Label>Force Password Change (90 days)</Label><Switch checked={security.forcePasswordChange} onCheckedChange={(v) => setSecurity({ ...security, forcePasswordChange: v })} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>Billing Settings</CardTitle></CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Stripe/webhook configuration and invoice settings will be managed here.</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
