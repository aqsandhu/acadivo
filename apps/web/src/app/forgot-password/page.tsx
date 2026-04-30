"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Mail, Send, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { forgotPassword } from "@/services/apiClient";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const forgotSchema = z.object({
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(10, "Invalid phone").optional().or(z.literal("")),
}).refine((data) => data.email || data.phone, {
  message: "Please enter email or phone",
  path: ["email"],
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await forgotPassword({
        email: data.email || undefined,
        phone: data.phone || undefined,
      });
      if (res.success) {
        setSent(true);
      } else {
        setError(res.error || "Failed to send OTP");
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
            {sent ? (
              <CheckCircle className="h-6 w-6 text-primary-800" />
            ) : (
              <Mail className="h-6 w-6 text-primary-800" />
            )}
          </div>
          <h1 className="mt-4 text-xl font-bold">{t("auth.resetPassword")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {sent
              ? t("auth.otpSent")
              : "Enter your email or phone number to receive a reset code."}
          </p>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="rounded-md bg-success-50 p-4 text-sm text-success-700 dark:bg-success-950 dark:text-success-300">
              {t("auth.otpSent")}. {t("auth.redirecting")}
            </div>
            <Button
              className="w-full"
              onClick={() => router.push("/verify-otp")}
            >
              {t("auth.verifyOtp")}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-danger-50 p-3 text-sm text-danger-700">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("auth.email")}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="your@email.com"
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm",
                    errors.email && "border-danger-500"
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-danger-500">{errors.email.message}</p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("auth.phone")}</label>
              <input
                {...register("phone")}
                type="tel"
                placeholder="+923001234567"
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                  errors.phone && "border-danger-500"
                )}
              />
              {errors.phone && (
                <p className="text-xs text-danger-500">{errors.phone.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              loadingText={t("common.loading")}
            >
              <Send className="mr-2 h-4 w-4" />
              {t("auth.sendOtp")}
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
