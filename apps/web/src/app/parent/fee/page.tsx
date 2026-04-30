"use client";

import { useEffect, useState } from "react";
import { ParentSidebar } from "@/components/layout/ParentSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FeeRecordCard } from "@/components/dashboard/FeeRecordCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getFeeRecords, getInstallmentSummary } from "@/services/apiClient";
import type { FeeRecord } from "@/types";
import { CreditCard, Smartphone, Landmark, Banknote, Receipt } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function ParentFeePage() {
  const { t } = useTranslation();
  const [records, setRecords] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [installments, setInstallments] = useState<any>(null);

  useEffect(() => {
    getFeeRecords().then((f) => { setRecords(f); setLoading(false); });
    // Fetch installment summary for first child if available
    getInstallmentSummary("me").then((s) => setInstallments(s)).catch(() => {});
  }, []);

  const totalDue = records.reduce((sum, r) => sum + r.balance, 0);

  return (
    <>
      <ParentSidebar />
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">{t("fee.feeRecord")}</h1>
          <div className="flex items-center gap-4 p-4 bg-card border rounded-lg">
            <CreditCard className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">{t("fee.totalAmount")}</p>
              <p className="text-2xl font-bold">{totalDue.toLocaleString()} PKR</p>
            </div>
          </div>

          {/* Pakistani Payment Methods */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
              <Smartphone className="h-6 w-6 text-orange-500" />
              <span className="text-xs">{t("payment.jazzCash")}</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
              <Smartphone className="h-6 w-6 text-green-600" />
              <span className="text-xs">{t("payment.easyPaisa")}</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
              <Landmark className="h-6 w-6 text-blue-600" />
              <span className="text-xs">{t("payment.bankTransfer")}</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
              <Banknote className="h-6 w-6 text-emerald-600" />
              <span className="text-xs">{t("payment.cash")}</span>
            </Button>
          </div>

          {/* Installment Summary */}
          {installments && (
            <div className="p-4 bg-card border rounded-lg space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                {t("installments.installmentSummary")}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">{t("installments.totalInstallments")}:</span> {installments.totalInstallments}</div>
                <div><span className="text-muted-foreground">{t("installments.paidInstallments")}:</span> {installments.paid}</div>
                <div><span className="text-muted-foreground">{t("installments.remainingInstallments")}:</span> {installments.pending + installments.overdue}</div>
                <div><span className="text-muted-foreground">{t("fee.balance")}:</span> {installments.totalBalance.toLocaleString()} PKR</div>
              </div>
            </div>
          )}

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
