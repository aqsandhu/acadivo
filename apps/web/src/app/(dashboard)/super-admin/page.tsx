"use client";

import { useTranslation } from "react-i18next";
import {
  School,
  Users,
  CreditCard,
  MessageSquare,
  UserPlus,
  Activity,
  Plus,
  Megaphone,
  BarChart3,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useMockApi, getDashboardStats, getSchools, type DashboardStats, type School } from "@/services/apiClient";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

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
            {change >= 0 ? "+" : ""}{change}% from last month
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SuperAdminDashboard() {
  const { t } = useTranslation();
  const { data: stats, loading: statsLoading } = useMockApi(getDashboardStats);
  const { data: schools, loading: schoolsLoading } = useMockApi(() => getSchools());

  const schoolsByCity = schools
    ? Object.entries(
        schools.reduce((acc, s) => {
          acc[s.city] = (acc[s.city] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([name, value]) => ({ name, value }))
    : [];

  const userGrowth = [
    { month: "Jan", users: 120 }, { month: "Feb", users: 180 }, { month: "Mar", users: 250 },
    { month: "Apr", users: 320 }, { month: "May", users: 400 }, { month: "Jun", users: 520 },
  ];

  const revenueTrend = [
    { month: "Jan", revenue: 50000 }, { month: "Feb", revenue: 65000 }, { month: "Mar", revenue: 80000 },
    { month: "Apr", revenue: 72000 }, { month: "May", revenue: 95000 }, { month: "Jun", revenue: 110000 },
  ];

  const subscriptionDist = [
    { name: "Basic", value: 3 }, { name: "Standard", value: 4 }, { name: "Premium", value: 2 }, { name: "Enterprise", value: 1 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{t("nav.dashboard")}</h2>
        <div className="flex gap-2">
          <Link href="/super-admin/schools">
            <Button size="sm"><Plus className="mr-2 h-4 w-4" />{t("common.add")} {t("nav.schools")}</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statsLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatCard label="Total Schools" value={stats?.totalSchools || 0} icon={<School className="h-4 w-4" />} change={12} />
            <StatCard label="Active Schools" value={stats?.activeSchools || 0} icon={<Activity className="h-4 w-4" />} change={8} />
            <StatCard label="Total Users" value={stats?.totalUsers || 0} icon={<Users className="h-4 w-4" />} change={15} />
            <StatCard label="Monthly Revenue" value={`PKR ${(stats?.monthlyRevenue || 0).toLocaleString()}`} icon={<CreditCard className="h-4 w-4" />} change={22} />
            <StatCard label="Messages Today" value={stats?.messagesSentToday || 0} icon={<MessageSquare className="h-4 w-4" />} />
            <StatCard label="New Signups" value={stats?.newSignups || 0} icon={<UserPlus className="h-4 w-4" />} change={-5} />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Schools by City</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={schoolsByCity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>User Growth</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Subscription Distribution</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={subscriptionDist} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                  {subscriptionDist.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Schools Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Schools</CardTitle>
          <Link href="/super-admin/schools"><Button variant="outline" size="sm"><BarChart3 className="mr-2 h-4 w-4" />View All</Button></Link>
        </CardHeader>
        <CardContent>
          {schoolsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : !schools?.length ? (
            <div className="py-8 text-center text-muted-foreground">{t("common.noData")}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.slice(0, 5).map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell>{school.city}</TableCell>
                    <TableCell>{school.plan}</TableCell>
                    <TableCell>
                      <Badge variant={school.status === "ACTIVE" ? "default" : school.status === "PENDING" ? "secondary" : "destructive"}>
                        {school.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{school.userCount}</TableCell>
                    <TableCell>
                      <Link href={`/super-admin/schools`}><Button variant="ghost" size="sm">View</Button></Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-primary/10 p-3 text-primary"><Plus className="h-5 w-5" /></div>
            <div><div className="font-semibold">Add School</div><div className="text-sm text-muted-foreground">Register a new institution</div></div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-primary/10 p-3 text-primary"><Megaphone className="h-5 w-5" /></div>
            <div><div className="font-semibold">Send Announcement</div><div className="text-sm text-muted-foreground">Broadcast system-wide message</div></div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-primary/10 p-3 text-primary"><BarChart3 className="h-5 w-5" /></div>
            <div><div className="font-semibold">View Analytics</div><div className="text-sm text-muted-foreground">Platform-wide insights</div></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
