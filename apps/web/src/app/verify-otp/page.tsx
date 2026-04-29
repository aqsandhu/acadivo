"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, KeyRound, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockApi } from "@/services/apiClient";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type OtpFormData = z.infer<typeof otpSchema>;

export default function VerifyOtpPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState("");
  const [resendTimer, setResendTimer] = React.useState(60);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: searchParams.get("otp") || "",
    },
  });

  const phone = searchParams.get("phone") || "";
  const email = searchParams.get("email") || "";
  const purpose = searchParams.get("purpose") || "login";

  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  const onSubmit = async (data: OtpFormData) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await mockApi.verifyOTP({
        phone: phone || undefined,
        email: email || undefined,
        otp: data.otp,
        purpose: purpose as any,
      });
      if (res.success && res.data?.verified) {
        setSuccess(true);
        if (purpose === "reset_password") {
          setTimeout(() => router.push(`/reset-password?otp=${data.otp}`), 1500);
        } else {
          setTimeout(() => router.push("/dashboard"), 1500);
        }
      } else {
        setError(t("auth.otpInvalid"));
      }
    } catch {
      setError(t("auth.otpInvalid"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendTimer(60);
    try {
      await mockApi.forgotPassword({ phone: phone || undefined, email: email || undefined });
    } catch {
      // ignore
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
              <KeyRound className="h-6 w-6 text-primary-800" />
            )}
          </div>
          <h1 className="mt-4 text-xl font-bold">{t("auth.verifyOtp")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {success
              ? t("auth.redirecting")
              : `Enter the 6-digit code sent to ${phone || email || "your device"}.`}
          </p>
        </div>

        {success ? (
          <div className="rounded-md bg-success-50 p-4 text-sm text-success-700 dark:bg-success-950 dark:text-success-300">
            {t("auth.redirecting")}
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
                  "flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-lg text-center tracking-[0.5em] font-mono",
                  errors.otp && "border-danger-500"
                )}
                autoFocus
              />
              {errors.otp && (
                <p className="text-xs text-danger-500">{errors.otp.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              loadingText={t("common.loading")}
            >
              {t("auth.verifyOtp")}
            </Button>

            <div className="text-center text-sm">
              {resendTimer > 0 ? (
                <span className="text-muted-foreground">
                  {t("auth.resendOtp")} in {resendTimer}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="font-medium text-primary-800 hover:underline dark:text-primary-400"
                >
                  {t("auth.resendOtp")}
                </button>
              )}
            </div>
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
