"use client";

import { useTranslation } from "react-i18next";
import {
  GraduationCap, Users, UserCircle, ClipboardList, Wallet, FileText,
  Bell, MessageSquare, Calendar, AlertCircle, TrendingUp, TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useMockApi, getPrincipalStats, getTeachers, getStudents, getParents, getAnnouncements, getFeeRecords } from "@/services/mockApi";
import Link from "next/link";

function StatCard({ label, value, icon, change }: { label: string; value: string | number; icon: React.ReactNode; change?: number }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className="rounded-md bg-primary/10 p-2 text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className={`flex items-center text-xs ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
            {change >= 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
            {change >= 0 ? "+" : ""}{change}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function PrincipalDashboard() {
  const { t } = useTranslation();
  const { data: stats, loading: statsLoading } = useMockApi(getPrincipalStats);
  const { data: teachers } = useMockApi(getTeachers);
  const { data: students } = useMockApi(getStudents);
  const { data: parents } = useMockApi(getParents);
  const { data: announcements } = useMockApi(getAnnouncements);
  const { data: feeRecords } = useMockApi(getFeeRecords);

  const pendingFee = feeRecords?.filter((r) => r.status !== "PAID").reduce((s, r) => s + r.due, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{t("nav.dashboard")}</h2>
        <div className="flex gap-2">
          <Link href="/principal/announcements"><Button size="sm"><Bell className="mr-2 h-4 w-4" />Announcement</Button></Link>
          <Link href="/principal/messages"><Button size="sm" variant="outline"><MessageSquare className="mr-2 h-4 w-4" />Message</Button></Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statsLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatCard label="Total Teachers" value={stats?.totalTeachers || 0} icon={<GraduationCap className="h-4 w-4" />} change={5} />
            <StatCard label="Total Students" value={stats?.totalStudents || 0} icon={<Users className="h-4 w-4" />} change={8} />
            <StatCard label="Total Parents" value={stats?.totalParents || 0} icon={<UserCircle className="h-4 w-4" />} />
            <StatCard label="Today\'s Attendance" value={`${stats?.attendanceToday || 0}%`} icon={<ClipboardList className="h-4 w-4" />} change={-2} />
            <StatCard label="Fee Collection (Month)" value={`PKR ${(stats?.feeCollectionThisMonth || 0).toLocaleString()}`} icon={<Wallet className="h-4 w-4" />} change={12} />
            <StatCard label="Pending Reports" value={stats?.pendingReports || 0} icon={<FileText className="h-4 w-4" />} />
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Recent Announcements</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {announcements?.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-start justify-between border-b pb-2 last:border-0">
                <div><div className="font-medium text-sm">{a.title}</div><div className="text-xs text-muted-foreground">{a.targetAudience.join(", ")}</div></div>
                <Badge variant={a.priority === "HIGH" ? "destructive" : "secondary"} className="text-xs">{a.priority}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pending Items</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm"><AlertCircle className="h-4 w-4 text-amber-500" /><span>Fee defaulters: PKR {pendingFee.toLocaleString()} pending</span></div>
            <div className="flex items-center gap-3 text-sm"><FileText className="h-4 w-4 text-blue-500" /><span>Reports to review: {stats?.pendingReports || 0}</span></div>
            <div className="flex items-center gap-3 text-sm"><Calendar className="h-4 w-4 text-green-500" /><span>Upcoming events this week</span></div>
            <div className="flex items-center gap-3 text-sm"><MessageSquare className="h-4 w-4 text-purple-500" /><span>Unread messages: {stats?.unreadMessages || 0}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Link href="/principal/announcements"><Button variant="outline" className="w-full justify-start" size="sm"><Bell className="mr-2 h-4 w-4" />Send Announcement</Button></Link>
            <Link href="/principal/messages"><Button variant="outline" className="w-full justify-start" size="sm"><MessageSquare className="mr-2 h-4 w-4" />Message Teacher</Button></Link>
            <Link href="/principal/attendance"><Button variant="outline" className="w-full justify-start" size="sm"><ClipboardList className="mr-2 h-4 w-4" />View Attendance</Button></Link>
            <Link href="/principal/fee"><Button variant="outline" className="w-full justify-start" size="sm"><Wallet className="mr-2 h-4 w-4" />Fee Overview</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
