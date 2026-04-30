"use client";

import { useTranslation } from "react-i18next";
import { Wallet, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useApi, getFeeRecords, getStudents } from "@/services/apiClient";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function PrincipalFeePage() {
  const { t } = useTranslation();
  const { data: feeRecords, loading } = useApi(getFeeRecords);
  const { data: students } = useApi(getStudents);

  const totalExpected = (feeRecords?.length || 0) * 2500;
  const totalCollected = feeRecords?.reduce((s, r) => s + r.paid, 0) || 0;
  const totalPending = feeRecords?.filter((r) => r.status !== "PAID").reduce((s, r) => s + r.due, 0) || 0;
  const defaulters = feeRecords?.filter((r) => r.status === "UNPAID") || [];

  const monthlyData = [
    { month: "Jan", collected: 45000, expected: 50000 },
    { month: "Feb", collected: 48000, expected: 50000 },
    { month: "Mar", collected: 42000, expected: 50000 },
    { month: "Apr", collected: 50000, expected: 50000 },
    { month: "May", collected: 47000, expected: 50000 },
    { month: "Jun", collected: 46000, expected: 50000 },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t("nav.fee")}</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Expected</CardTitle><Wallet className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">PKR {totalExpected.toLocaleString()}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Collected</CardTitle><TrendingUp className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">PKR {totalCollected.toLocaleString()}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Pending</CardTitle><AlertTriangle className="h-4 w-4 text-red-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">PKR {totalPending.toLocaleString()}</div></CardContent></Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader><CardTitle>Monthly Collection</CardTitle></CardHeader><CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip />
              <Bar dataKey="collected" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expected" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Fee Defaulters</CardTitle></CardHeader><CardContent className="h-64 overflow-y-auto">
          {defaulters.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">No defaulters</div>
          ) : (
            <div className="space-y-2">
              {defaulters.slice(0, 10).map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-md border p-2">
                  <div><div className="font-medium text-sm">{d.studentName}</div><div className="text-xs text-muted-foreground">PKR {d.due} due</div></div>
                  <Badge variant="destructive">Unpaid</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Fee Records</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Student</TableHead><TableHead>Amount</TableHead><TableHead>Paid</TableHead><TableHead>Due</TableHead><TableHead>Status</TableHead><TableHead>Month</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {feeRecords?.slice(0, 10).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.studentName}</TableCell>
                      <TableCell>PKR {r.amount}</TableCell>
                      <TableCell>PKR {r.paid}</TableCell>
                      <TableCell>PKR {r.due}</TableCell>
                      <TableCell><Badge variant={r.status === "PAID" ? "default" : r.status === "PARTIAL" ? "secondary" : "destructive"}>{r.status}</Badge></TableCell>
                      <TableCell>{r.month}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
