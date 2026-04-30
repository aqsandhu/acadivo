"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, School, Lock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const loginSchema = z.object({
  uniqueId: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { login, isLoading, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [loginError, setLoginError] = React.useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: LoginFormData) => {
    setLoginError("");
    try {
      await login({ uniqueId: data.uniqueId, password: data.password });
    } catch (err) {
      setLoginError(
        err instanceof Error ? err.message : t("auth.loginFailed")
      );
    }
  };

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" text={t("auth.redirecting")} />
      </div>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-800">
            <School className="h-8 w-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              {t("common.appName")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("auth.welcomeMessage")}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {loginError && (
            <div className="rounded-md bg-danger-50 p-3 text-sm text-danger-700 dark:bg-danger-950 dark:text-danger-300">
              {loginError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              {t("auth.username")}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                {...register("uniqueId")}
                type="text"
                placeholder={t("auth.username")}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  errors.uniqueId && "border-danger-500"
                )}
                autoComplete="username"
              />
            </div>
            {errors.uniqueId && (
              <p className="text-xs text-danger-500">{errors.uniqueId.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {t("auth.sharedIdHint")}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              {t("auth.password")}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.password")}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background py-2 pl-10 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  errors.password && "border-danger-500"
                )}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
                aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-danger-500">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-gray-300" />
              <span>{t("auth.rememberMe")}</span>
            </label>
            <a
              href="/forgot-password"
              className="text-primary-800 hover:underline dark:text-primary-400"
            >
              {t("auth.forgotPassword")}
            </a>
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
            loadingText={t("common.loading")}
          >
            {t("auth.login")}
          </Button>
        </form>

        {/* Parent setup link */}
        <div className="text-center text-sm">
          <span className="text-muted-foreground">{t("auth.noAccount")}</span>{" "}
          <a
            href="/setup-parent-password"
            className="font-medium text-primary-800 hover:underline dark:text-primary-400"
          >
            {t("auth.setupParentPassword")}
          </a>
        </div>

        {/* Footer */}
        <div className="border-t pt-4 text-center text-xs text-muted-foreground">
          {t("common.poweredBy")}
        </div>
      </div>
    </AuthLayout>
  );
}
