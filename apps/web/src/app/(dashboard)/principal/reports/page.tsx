"use client";

import { useTranslation } from "react-i18next";
import { FileText, Download, Users, ClipboardList, GraduationCap, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApi, getStudents, getTeachers, getAttendance } from "@/services/apiClient";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function PrincipalReportsPage() {
  const { t } = useTranslation();
  const { data: students } = useApi(getStudents);
  const { data: teachers } = useApi(getTeachers);
  const { data: attendance } = useApi(getAttendance);

  const enrollmentByClass = students
    ? Object.entries(students.reduce((acc, s) => { acc[s.class] = (acc[s.class] || 0) + 1; return acc; }, {} as Record<string, number>))
      .map(([name, value]) => ({ name, value }))
    : [];

  const genderDist = [
    { name: "Male", value: Math.round((students?.length || 0) * 0.55) },
    { name: "Female", value: Math.round((students?.length || 0) * 0.45) },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t("nav.reports")}</h2>
      <Tabs defaultValue="enrollment">
        <TabsList>
          <TabsTrigger value="enrollment"><Users className="mr-2 h-4 w-4" />Enrollment</TabsTrigger>
          <TabsTrigger value="attendance"><ClipboardList className="mr-2 h-4 w-4" />Attendance</TabsTrigger>
          <TabsTrigger value="academic"><GraduationCap className="mr-2 h-4 w-4" />Academic</TabsTrigger>
          <TabsTrigger value="teachers"><TrendingUp className="mr-2 h-4 w-4" />Teachers</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollment" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle>Enrollment by Class</CardTitle></CardHeader><CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentByClass}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent></Card>
            <Card><CardHeader><CardTitle>Gender Distribution</CardTitle></CardHeader><CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={genderDist} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                    {genderDist.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent></Card>
          </div>
          <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export Enrollment CSV</Button>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4 mt-4">
          <Card><CardHeader><CardTitle>Monthly Attendance</CardTitle></CardHeader><CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { month: "Jan", present: 92, absent: 5, late: 3 },
                { month: "Feb", present: 94, absent: 4, late: 2 },
                { month: "Mar", present: 90, absent: 7, late: 3 },
                { month: "Apr", present: 93, absent: 5, late: 2 },
                { month: "May", present: 95, absent: 3, late: 2 },
                { month: "Jun", present: 91, absent: 6, late: 3 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip />
                <Bar dataKey="present" fill="#10b981" /><Bar dataKey="absent" fill="#ef4444" /><Bar dataKey="late" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent></Card>
          <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export Attendance CSV</Button>
        </TabsContent>

        <TabsContent value="academic" className="space-y-4 mt-4">
          <Card><CardHeader><CardTitle>Academic Performance Overview</CardTitle></CardHeader><CardContent className="h-64">
            <div className="flex h-full items-center justify-center text-muted-foreground">Academic performance data will be displayed here.</div>
          </CardContent></Card>
          <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export Academic CSV</Button>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4 mt-4">
          <Card><CardHeader><CardTitle>Teacher Performance</CardTitle></CardHeader><CardContent className="h-64">
            <div className="flex h-full items-center justify-center text-muted-foreground">Teacher performance metrics will be displayed here.</div>
          </CardContent></Card>
          <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export Teacher CSV</Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
