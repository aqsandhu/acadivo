"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Lock, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockApi } from "@/services/mockApi";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";

const resetSchema = z
  .object({
    otp: z.string().length(6, "OTP must be 6 digits"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type ResetFormData = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      otp: searchParams.get("otp") || "",
    },
  });

  const newPassword = watch("newPassword");

  const getPasswordStrength = (pwd: string): number => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getPasswordStrength(newPassword || "");
  const strengthLabels = [
    t("auth.passwordWeak"),
    t("auth.passwordFair"),
    t("auth.passwordGood"),
    t("auth.passwordStrong"),
  ];
  const strengthColors = ["bg-danger-500", "bg-warning-500", "bg-info-500", "bg-success-500"];

  const onSubmit = async (data: ResetFormData) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await mockApi.resetPassword({
        otp: data.otp,
        newPassword: data.newPassword,
      });
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || "Reset failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
            {success ? (
              <CheckCircle className="h-6 w-6 text-success-500" />
            ) : (
              <Lock className="h-6 w-6 text-primary-800" />
            )}
          </div>
          <h1 className="mt-4 text-xl font-bold">{t("auth.resetPassword")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {success
              ? t("auth.passwordResetSuccess")
              : "Enter the OTP and your new password."}
          </p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="rounded-md bg-success-50 p-4 text-sm text-success-700 dark:bg-success-950 dark:text-success-300">
              {t("auth.passwordResetSuccess")}. {t("auth.redirecting")}
            </div>
            <Button className="w-full" onClick={() => router.push("/login")}>
              {t("auth.backToLogin")}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-danger-50 p-3 text-sm text-danger-700">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("auth.otpCode")}</label>
              <input
                {...register("otp")}
                type="text"
                maxLength={6}
                placeholder="123456"
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-center tracking-[0.5em] font-mono",
                  errors.otp && "border-danger-500"
                )}
              />
              {errors.otp && (
                <p className="text-xs text-danger-500">{errors.otp.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("auth.newPassword")}</label>
              <input
                {...register("newPassword")}
                type="password"
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                  errors.newPassword && "border-danger-500"
                )}
              />
              {newPassword && (
                <div className="space-y-1">
                  <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("transition-all", strengthColors[strength - 1] || "bg-muted")}
                      style={{ width: `${(strength / 4) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("auth.passwordStrength")}: {strengthLabels[strength - 1] || "–"}
                  </p>
                </div>
              )}
              {errors.newPassword && (
                <p className="text-xs text-danger-500">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("auth.confirmPassword")}</label>
              <input
                {...register("confirmPassword")}
                type="password"
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                  errors.confirmPassword && "border-danger-500"
                )}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-danger-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              loadingText={t("common.loading")}
            >
              {t("auth.resetPassword")}
            </Button>
          </form>
        )}

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => router.push("/login")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("auth.backToLogin")}
        </Button>
      </div>
    </AuthLayout>
  );
}
