"use client";

import * as React from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const variantConfig = {
  success: {
    icon: CheckCircle,
    classes: "border-success-200 bg-success-50 text-success-800 dark:bg-success-950 dark:text-success-200",
    iconColor: "text-success-500",
  },
  error: {
    icon: AlertCircle,
    classes: "border-danger-200 bg-danger-50 text-danger-800 dark:bg-danger-950 dark:text-danger-200",
    iconColor: "text-danger-500",
  },
  warning: {
    icon: AlertTriangle,
    classes: "border-warning-200 bg-warning-50 text-warning-800 dark:bg-warning-950 dark:text-warning-200",
    iconColor: "text-warning-500",
  },
  info: {
    icon: Info,
    classes: "border-info-200 bg-info-50 text-info-800 dark:bg-info-950 dark:text-info-200",
    iconColor: "text-info-500",
  },
};

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isExiting, setIsExiting] = React.useState(false);
  const config = variantConfig[toast.variant];
  const Icon = config.icon;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 200);
    }, toast.duration ?? 5000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg transition-all",
        config.classes,
        isExiting ? "translate-x-full opacity-0" : "animate-slideInRight"
      )}
      role="alert"
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", config.iconColor)} />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{toast.title}</p>
        {toast.description && (
          <p className="text-sm opacity-90">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onRemove(toast.id), 200);
        }}
        className="shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 p-4 sm:bottom-6 sm:right-6">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = React.useCallback(
    (title: string, description?: string) =>
      addToast({ title, description, variant: "success" }),
    [addToast]
  );

  const error = React.useCallback(
    (title: string, description?: string) =>
      addToast({ title, description, variant: "error" }),
    [addToast]
  );

  const warning = React.useCallback(
    (title: string, description?: string) =>
      addToast({ title, description, variant: "warning" }),
    [addToast]
  );

  const info = React.useCallback(
    (title: string, description?: string) =>
      addToast({ title, description, variant: "info" }),
    [addToast]
  );

  return { toasts, addToast, removeToast, success, error, warning, info };
}
