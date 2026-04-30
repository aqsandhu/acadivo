"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { changePassword, updateProfile } from "@/services/apiClient";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Camera, Lock, User, Mail, Phone, Save, Loader2, Volume2, Bell, Globe } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [profile, setProfile] = useState<Record<string, any>>({});
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notificationSounds, setNotificationSounds] = useLocalStorage("acadivo-notification-sounds", true);
  const [pushNotifications, setPushNotifications] = useLocalStorage("acadivo-push-notifications", true);
  const [language, setLanguage] = useLocalStorage("acadivo-language", "en");

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        uniqueId: user.uniqueId || "",
      });
      setAvatar(user.avatar || null);
      setLoading(false);
    }
  }, [user]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("profile.invalidImage"));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("profile.imageTooLarge"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
    try {
      const res = await updateProfile({ avatar: file } as any);
      if (res.success) {
        toast.success(t("profile.avatarUpdated"));
      } else {
        toast.error(res.error || t("profile.updateFailed"));
      }
    } catch {
      toast.error(t("profile.updateFailed"));
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      });
      toast.success(t("profile.updated"));
    } catch (err: any) {
      toast.error(err?.message || t("profile.updateFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error(t("profile.passwordsMismatch"));
      return;
    }
    if (passwords.new.length < 6) {
      toast.error(t("profile.passwordTooShort"));
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      if (res.success) {
        toast.success(t("profile.passwordChanged"));
        setPasswords({ current: "", new: "", confirm: "" });
      } else {
        toast.error(res.error || t("profile.passwordChangeFailed"));
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || t("profile.passwordChangeFailed"));
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-3xl mx-auto">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold">{t("nav.profile")}</h1>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("profile.personalInfo")}</CardTitle>
            <CardDescription>{t("profile.personalInfoDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative cursor-pointer group" onClick={handleAvatarClick}>
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatar || undefined} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {profile.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <div>
                <p className="font-medium">{profile.name}</p>
                <p className="text-sm text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </div>

            <Separator />

            {/* Form Fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name"><User className="inline h-3.5 w-3.5 mr-1" />{t("common.name")}</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uniqueId">{t("common.id")}</Label>
                <Input id="uniqueId" value={profile.uniqueId} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email"><Mail className="inline h-3.5 w-3.5 mr-1" />{t("common.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone"><Phone className="inline h-3.5 w-3.5 mr-1" />{t("common.phone")}</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
            </div>

            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {t("common.save")}
            </Button>
          </CardContent>
        </Card>

        {/* Password Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("profile.changePassword")}</CardTitle>
            <CardDescription>{t("profile.changePasswordDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current"><Lock className="inline h-3.5 w-3.5 mr-1" />{t("profile.currentPassword")}</Label>
              <Input
                id="current"
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">{t("profile.newPassword")}</Label>
              <Input
                id="new"
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">{t("profile.confirmPassword")}</Label>
              <Input
                id="confirm"
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              />
            </div>
            <Button variant="outline" onClick={handleChangePassword} disabled={passwordSaving}>
              {passwordSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
              {t("profile.changePasswordBtn")}
            </Button>
          </CardContent>
        </Card>

        {/* Preferences Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("profile.preferences")}</CardTitle>
            <CardDescription>{t("profile.preferencesDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notification-sounds" className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  {t("profile.notificationSounds")}
                </Label>
                <p className="text-sm text-muted-foreground">{t("profile.notificationSoundsDesc")}</p>
              </div>
              <Switch
                id="notification-sounds"
                checked={notificationSounds}
                onCheckedChange={setNotificationSounds}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  {t("profile.pushNotifications")}
                </Label>
                <p className="text-sm text-muted-foreground">{t("profile.pushNotificationsDesc")}</p>
              </div>
              <Switch
                id="push-notifications"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="language" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {t("profile.language")}
                </Label>
                <p className="text-sm text-muted-foreground">{t("profile.languageDesc")}</p>
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language" className="w-40">
                  <SelectValue placeholder={t("profile.selectLanguage")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ur">Urdu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={async () => {
                setSettingsSaving(true);
                try {
                  const { updateUserSettings } = await import("@/services/apiClient");
                  await updateUserSettings({
                    notificationSounds,
                    pushNotifications,
                    language,
                  });
                  toast.success(t("profile.settingsSaved"));
                } catch {
                  toast.error(t("profile.settingsSaveFailed"));
                } finally {
                  setSettingsSaving(false);
                }
              }}
              disabled={settingsSaving}
            >
              {settingsSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {t("profile.savePreferences")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
