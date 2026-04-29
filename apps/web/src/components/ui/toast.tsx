"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  onClose?: () => void;
}

function Toast({ title, description, variant = "default", onClose }: ToastProps) {
  return (
    <div
      className={cn(
        "pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
        variant === "destructive" && "border-destructive bg-destructive text-destructive-foreground",
        variant === "success" && "border-green-600 bg-green-50 text-green-900",
        variant === "default" && "border bg-background text-foreground"
      )}
    >
      <div className="grid gap-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      {onClose && (
        <button onClick={onClose} className="absolute right-2 top-2 rounded-md p-1 opacity-70 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

interface ToasterProps {
  toasts: { id: string; title?: string; description?: string; variant?: "default" | "destructive" | "success" }[];
  removeToast: (id: string) => void;
}

function Toaster({ toasts, removeToast }: ToasterProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

export { Toast, Toaster };
