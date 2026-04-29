"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary-800 text-white hover:bg-primary-700",
        secondary: "border-transparent bg-secondary-500 text-white hover:bg-secondary-600",
        success: "border-transparent bg-success-500 text-white hover:bg-success-600",
        danger: "border-transparent bg-danger-500 text-white hover:bg-danger-600",
        warning: "border-transparent bg-warning-500 text-white hover:bg-warning-600",
        info: "border-transparent bg-info-500 text-white hover:bg-info-600",
        outline: "text-foreground",
        ghost: "border-transparent bg-muted text-muted-foreground hover:bg-muted/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
