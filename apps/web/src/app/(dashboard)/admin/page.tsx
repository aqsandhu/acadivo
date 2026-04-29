"use client";

import { useTranslation } from "react-i18next";
import {
  GraduationCap, Users, UserCircle, School, Wallet, ClipboardList,
  Bell, Plus, Calendar, AlertCircle, TrendingUp, TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMockApi, getAdminStats, getTeachers, getStudents, getParents, getClasses, getFeeRecords } from "@/services/mockApi";
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

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { data: stats, loading: statsLoading } = useMockApi(getAdminStats);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{t("nav.dashboard")}</h2>
        <div className="flex gap-2">
          <Link href="/admin/teachers"><Button size="sm"><Plus className="mr-2 h-4 w-4" />Teacher</Button></Link>
          <Link href="/admin/students"><Button size="sm" variant="outline"><Plus className="mr-2 h-4 w-4" />Student</Button></Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statsLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatCard label="Teachers" value={stats?.teachers || 0} icon={<GraduationCap className="h-4 w-4" />} change={3} />
            <StatCard label="Students" value={stats?.students || 0} icon={<Users className="h-4 w-4" />} change={5} />
            <StatCard label="Parents" value={stats?.parents || 0} icon={<UserCircle className="h-4 w-4" />} />
            <StatCard label="Classes" value={stats?.classes || 0} icon={<School className="h-4 w-4" />} />
            <StatCard label="Pending Fee" value={`PKR ${(stats?.pendingFee || 0).toLocaleString()}`} icon={<Wallet className="h-4 w-4" />} change={-8} />
            <StatCard label="Today\'s Attendance" value={`${stats?.attendanceToday || 0}%`} icon={<ClipboardList className="h-4 w-4" />} />
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Link href="/admin/attendance"><Button variant="outline" className="w-full justify-start" size="sm"><ClipboardList className="mr-2 h-4 w-4" />Mark Attendance</Button></Link>
            <Link href="/admin/fee"><Button variant="outline" className="w-full justify-start" size="sm"><Wallet className="mr-2 h-4 w-4" />Record Fee</Button></Link>
            <Link href="/admin/timetable"><Button variant="outline" className="w-full justify-start" size="sm"><Calendar className="mr-2 h-4 w-4" />Timetable</Button></Link>
            <Link href="/admin/announcements"><Button variant="outline" className="w-full justify-start" size="sm"><Bell className="mr-2 h-4 w-4" />Post Notice</Button></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recent Activities</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm"><AlertCircle className="h-4 w-4 text-blue-500" /><span>New student registered: Ali Khan</span></div>
            <div className="flex items-center gap-3 text-sm"><AlertCircle className="h-4 w-4 text-green-500" /><span>Fee collected: PKR 15,000</span></div>
            <div className="flex items-center gap-3 text-sm"><AlertCircle className="h-4 w-4 text-amber-500" /><span>Attendance marked for Class 5</span></div>
            <div className="flex items-center gap-3 text-sm"><AlertCircle className="h-4 w-4 text-purple-500" /><span>Teacher assigned to Math</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
