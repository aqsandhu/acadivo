"use client";

import { useEffect, useState } from "react";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ResultCard } from "@/components/dashboard/ResultCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getResults } from "@/services/apiClient";
import type { ResultItem } from "@/types";
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function StudentResultsPage() {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResults().then((r) => { setResults(r); setLoading(false); });
  }, []);

  const chartData = results.length > 0 ? results[0].subjects.map((s) => ({ subject: s.subject, marks: s.obtainedMarks })) : [];
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <>
      <StudentSidebar />
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">My Results</h1>
            <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Download Report</Button>
          </div>
          {loading ? <Skeleton className="h-96" /> : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {results.map((r) => <ResultCard key={r.id} result={r} />)}
              </div>
              <div className="h-72">
                <h3 className="text-lg font-semibold mb-3">Subject-wise Performance</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="subject" /><YAxis /><Tooltip />
                    <Bar dataKey="marks">
                      {chartData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
