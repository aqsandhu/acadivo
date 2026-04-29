"use client";

import { useEffect, useState } from "react";
import { ParentSidebar } from "@/components/layout/ParentSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ResultCard } from "@/components/dashboard/ResultCard";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { mockApi } from "@/services/mockApi";
import type { ResultItem, ChildProfile } from "@/types";
import { Download } from "lucide-react";

export default function ParentResultsPage() {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockApi.getChildren().then((c) => { setChildren(c); if (c.length > 0) setSelectedChild(c[0].id); });
  }, []);

  useEffect(() => {
    setLoading(true);
    mockApi.getResults(selectedChild).then((r) => { setResults(r); setLoading(false); });
  }, [selectedChild]);

  return (
    <>
      <ParentSidebar />
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Child Results</h1>
            <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Download Reports</Button>
          </div>
          <div>
            <Label>Select Child</Label>
            <Select value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)}>
              {children.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </Select>
          </div>
          {loading ? <Skeleton className="h-96" /> : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {results.map((r) => <ResultCard key={r.id} result={r} />)}
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
