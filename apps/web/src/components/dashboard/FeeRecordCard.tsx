"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar } from "lucide-react";
import { cn } from "@/utils/cn";
import type { FeeRecord } from "@/types";

const statusColors = {
  paid: "bg-green-500/10 text-green-700 border-green-500/20",
  unpaid: "bg-red-500/10 text-red-700 border-red-500/20",
  partial: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
};

interface FeeRecordCardProps {
  record: FeeRecord;
}

export function FeeRecordCard({ record }: FeeRecordCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{record.studentName}</h3>
            <p className="text-sm text-muted-foreground">{record.className} • {record.feeType}</p>
          </div>
          <Badge variant="outline" className={cn(statusColors[record.status])}>{record.status}</Badge>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total</p>
            <p className="font-medium">{record.totalAmount.toLocaleString()} PKR</p>
          </div>
          <div>
            <p className="text-muted-foreground">Discount</p>
            <p className="font-medium">{record.discount.toLocaleString()} PKR</p>
          </div>
          <div>
            <p className="text-muted-foreground">Paid</p>
            <p className="font-medium">{record.paidAmount.toLocaleString()} PKR</p>
          </div>
          <div>
            <p className="text-muted-foreground">Balance</p>
            <p className={cn("font-medium", record.balance > 0 ? "text-red-600" : "text-green-600")}>{record.balance.toLocaleString()} PKR</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          Due: {new Date(record.dueDate).toLocaleDateString()}
          {record.paymentDate && <span className="ml-2 text-green-600">Paid on {new Date(record.paymentDate).toLocaleDateString()}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
