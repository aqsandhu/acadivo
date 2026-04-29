"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Lock, User, Phone, CheckCircle, AlertTriangle, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockApi } from "@/services/apiClient";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";

const setupSchema = z
  .object({
    studentId: z.string().min(1, "Student ID is required"),
    phone: z.string().min(10, "Invalid phone number"),
    otp: z.string().length(6, "OTP must be 6 digits"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type SetupFormData = z.infer<typeof setupSchema>;

export default function SetupParentPasswordPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState(false);
  const [otpSent, setOtpSent] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      studentId: searchParams.get("studentId") || "",
      phone: searchParams.get("phone") || "",
    },
  });

  const phoneValue = watch("phone");

  const sendOTP = async () => {
    if (!phoneValue || phoneValue.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    setIsLoading(true);
    try {
      const res = await mockApi.forgotPassword({ phone: phoneValue });
      if (res.success) {
        setOtpSent(true);
        setError("");
      } else {
        setError(res.error || "Failed to send OTP");
      }
    } catch {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SetupFormData) => {
    setIsLoading(true);
    setError("");
    try {
      const verifyRes = await mockApi.verifyOTP({
        phone: data.phone,
        otp: data.otp,
        purpose: "parent_setup",
      });
      if (!verifyRes.success || !verifyRes.data?.verified) {
        setError(t("auth.otpInvalid"));
        setIsLoading(false);
        return;
      }
      // Simulate parent setup
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSuccess(true);
    } catch {
      setError("Setup failed");
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
          <h1 className="mt-4 text-xl font-bold">{t("auth.setupParentPassword")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {success
              ? t("auth.parentSetupSuccess")
              : "Set up your parent account to monitor your child's progress."}
          </p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="rounded-md bg-success-50 p-4 text-sm text-success-700 dark:bg-success-950 dark:text-success-300">
              {t("auth.parentSetupSuccess")}. {t("auth.redirecting")}
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
              <label className="text-sm font-medium">{t("auth.studentId")}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  {...register("studentId")}
                  type="text"
                  placeholder={t("auth.enterStudentId")}
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm",
                    errors.studentId && "border-danger-500"
                  )}
                />
              </div>
              {errors.studentId && (
                <p className="text-xs text-danger-500">{errors.studentId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("auth.phone")}</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    {...register("phone")}
                    type="tel"
                    placeholder="+923001234567"
                    readOnly={otpSent}
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm",
                      errors.phone && "border-danger-500",
                      otpSent && "bg-muted"
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={sendOTP}
                  disabled={otpSent || isLoading}
                  loading={isLoading && !otpSent}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {otpSent ? "Sent" : t("auth.sendOtp")}
                </Button>
              </div>
              {errors.phone && (
                <p className="text-xs text-danger-500">{errors.phone.message}</p>
              )}
            </div>

            {otpSent && (
              <>
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
                    {...register("password")}
                    type="password"
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                      errors.password && "border-danger-500"
                    )}
                  />
                  {errors.password && (
                    <p className="text-xs text-danger-500">{errors.password.message}</p>
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
                  {t("auth.setupParentPassword")}
                </Button>
              </>
            )}
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
