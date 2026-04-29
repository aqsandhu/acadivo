"use client";

import { useEffect, useState } from "react";
import { ParentSidebar } from "@/components/layout/ParentSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FeeRecordCard } from "@/components/dashboard/FeeRecordCard";
import { Skeleton } from "@/components/ui/skeleton";
import { mockApi } from "@/services/apiClient";
import type { FeeRecord } from "@/types";
import { CreditCard } from "lucide-react";

export default function ParentFeePage() {
  const [records, setRecords] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockApi.getFeeRecords().then((f) => { setRecords(f); setLoading(false); });
  }, []);

  const totalDue = records.reduce((sum, r) => sum + r.balance, 0);

  return (
    <>
      <ParentSidebar />
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Fee Records</h1>
          <div className="flex items-center gap-4 p-4 bg-card border rounded-lg">
            <CreditCard className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Balance Due</p>
              <p className="text-2xl font-bold">{totalDue.toLocaleString()} PKR</p>
            </div>
          </div>
          {loading ? <div className="space-y-3"><Skeleton className="h-40" /><Skeleton className="h-40" /></div> : (
            <div className="space-y-3">
              {records.map((r) => <FeeRecordCard key={r.id} record={r} />)}
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
