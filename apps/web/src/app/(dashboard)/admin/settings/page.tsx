"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Settings, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectOption } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/useToast";
import { Toaster } from "@/components/ui/toast";

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const { toasts, addToast, removeToast } = useToast();
  const [general, setGeneral] = useState({ name: "Allama Iqbal Public School", email: "info@school.edu.pk", phone: "+92 42 1234567", address: "Lahore, Punjab, Pakistan" });
  const [academic, setAcademic] = useState({ grading: "Percentage", year: "2024-2025", terms: "2" });
  const [fee, setFee] = useState({ lateFee: "200", currency: "PKR" });
  const [notifications, setNotifications] = useState({ email: true, sms: true, push: false });

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

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="fee">Fee</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>School Information</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2"><Label>School Name</Label><Input value={general.name} onChange={(e) => setGeneral({ ...general, name: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Email</Label><Input value={general.email} onChange={(e) => setGeneral({ ...general, email: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Phone</Label><Input value={general.phone} onChange={(e) => setGeneral({ ...general, phone: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Address</Label><Input value={general.address} onChange={(e) => setGeneral({ ...general, address: e.target.value })} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>Academic Settings</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2"><Label>Grading Scheme</Label>
                <Select value={academic.grading} onValueChange={(value) => setAcademic({ ...academic, grading: value })}>
                  <SelectOption value="Percentage">Percentage</SelectOption>
                  <SelectOption value="GPA">GPA</SelectOption>
                  <SelectOption value="Letter">Letter Grades</SelectOption>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Academic Year</Label><Input value={academic.year} onChange={(e) => setAcademic({ ...academic, year: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Terms per Year</Label><Input type="number" value={academic.terms} onChange={(e) => setAcademic({ ...academic, terms: e.target.value })} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fee" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>Fee Settings</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2"><Label>Default Late Fee (PKR)</Label><Input value={fee.lateFee} onChange={(e) => setFee({ ...fee, lateFee: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Currency</Label>
                <Select value={fee.currency} onValueChange={(value) => setFee({ ...fee, currency: value })}>
                  <SelectOption value="PKR">PKR (Pakistani Rupee)</SelectOption>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><Label>Email Notifications</Label><Switch checked={notifications.email} onCheckedChange={(v) => setNotifications({ ...notifications, email: v })} /></div>
              <div className="flex items-center justify-between"><Label>SMS Notifications</Label><Switch checked={notifications.sms} onCheckedChange={(v) => setNotifications({ ...notifications, sms: v })} /></div>
              <div className="flex items-center justify-between"><Label>Push Notifications</Label><Switch checked={notifications.push} onCheckedChange={(v) => setNotifications({ ...notifications, push: v })} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>User Permissions</CardTitle></CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Sub-admin permission settings will be configured here.</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
