"use client";

import * as React from "react";
import { Tooltip as RadixTooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
}

export function Tooltip({
  children,
  content,
  side = "top",
  align = "center",
  className,
}: TooltipProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <RadixTooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={cn(
            "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-fadeIn",
            className
          )}
        >
          {content}
        </TooltipContent>
      </RadixTooltip>
    </TooltipProvider>
  );
}
