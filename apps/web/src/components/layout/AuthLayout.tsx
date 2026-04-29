"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-muted/30 flex items-center justify-center p-4">
      <div
        className={cn(
          "w-full max-w-md rounded-xl border bg-card p-6 shadow-lg sm:p-8",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
