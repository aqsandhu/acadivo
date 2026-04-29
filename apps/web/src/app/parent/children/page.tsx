"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ParentSidebar } from "@/components/layout/ParentSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ChildProfileCard } from "@/components/dashboard/ChildProfileCard";
import { Skeleton } from "@/components/ui/skeleton";
import { mockApi } from "@/services/mockApi";
import type { ChildProfile } from "@/types";

export default function ParentChildrenPage() {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockApi.getChildren().then((c) => { setChildren(c); setLoading(false); });
  }, []);

  return (
    <>
      <ParentSidebar />
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">My Children</h1>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2].map(i => <Skeleton key={i} className="h-48" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children.map((c) => (
                <Link key={c.id} href={`/parent/children/${c.id}`} className="block">
                  <ChildProfileCard child={c} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
