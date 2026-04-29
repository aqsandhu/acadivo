"use client";

import { useTranslation } from "react-i18next";
import { BarChart3, TrendingUp, Users, School, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMockApi, getDashboardStats, getSchools } from "@/services/apiClient";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, AreaChart, Area,
} from "recharts";

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const { data: stats, loading } = useMockApi(getDashboardStats);
  const { data: schools } = useMockApi(() => getSchools());

  const activityData = [
    { day: "Mon", active: 320, new: 45 }, { day: "Tue", active: 410, new: 38 },
    { day: "Wed", active: 380, new: 52 }, { day: "Thu", active: 450, new: 30 },
    { day: "Fri", active: 390, new: 42 }, { day: "Sat", active: 280, new: 25 },
    { day: "Sun", active: 220, new: 18 },
  ];

  const funnelData = [
    { stage: "Visitors", count: 5000 }, { stage: "Signups", count: 1200 },
    { stage: "Onboarded", count: 800 }, { stage: "Active", count: 620 },
    { stage: "Premium", count: 210 },
  ];

  const cityData = schools
    ? Object.entries(schools.reduce((acc, s) => { acc[s.city] = (acc[s.city] || 0) + 1; return acc; }, {} as Record<string, number>))
      .map(([city, count]) => ({ city, count })).sort((a, b) => b.count - a.count)
    : [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t("nav.analytics")}</h2>

      <div className="grid gap-4 md:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalUsers}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Active Schools</CardTitle><School className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.activeSchools}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Revenue</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">PKR {(stats?.monthlyRevenue || 0).toLocaleString()}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Engagement</CardTitle><Activity className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">87%</div></CardContent></Card>
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader><CardTitle>User Activity</CardTitle></CardHeader><CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip />
              <Line type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="new" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Onboarding Funnel</CardTitle></CardHeader><CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="stage" type="category" width={80} /><Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Geographic Distribution</CardTitle></CardHeader><CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cityData}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="city" /><YAxis /><Tooltip />
              <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Engagement Metrics</CardTitle></CardHeader><CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip />
              <Area type="monotone" dataKey="active" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent></Card>
      </div>
    </div>
  );
}
