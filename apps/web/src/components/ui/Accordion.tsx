"use client";

import * as React from "react";
import {
  Accordion as RadixAccordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionItemData {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItemData[];
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  className?: string;
}

export function Accordion({
  items,
  type = "single",
  defaultValue,
  className,
}: AccordionProps) {
  return (
    <RadixAccordion
      type={type}
      defaultValue={defaultValue}
      collapsible={type === "single" ? true : undefined}
      className={cn("w-full", className)}
    >
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          value={item.id}
          disabled={item.disabled}
          className="border-b"
        >
          <AccordionTrigger className="flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180">
            {item.title}
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
          </AccordionTrigger>
          <AccordionContent className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="pb-4 pt-0">{item.content}</div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </RadixAccordion>
  );
}
