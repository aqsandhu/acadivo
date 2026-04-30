"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, UserCircle, Eye, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectOption } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useMockApi, getParents } from "@/services/apiClient";

export default function PrincipalParentsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { data: parents, loading } = useMockApi(() => getParents({ search: search || undefined, status: statusFilter || undefined }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t("nav.parents")}</h2>
      <Card>
        <CardContent className="flex flex-wrap gap-4 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("common.search")} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
            <SelectOption value="">All Status</SelectOption>
            <SelectOption value="ACTIVE">Active</SelectOption>
            <SelectOption value="INACTIVE">Inactive</SelectOption>
          </Select>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : !parents?.length ? (
            <div className="py-12 text-center text-muted-foreground">{t("common.noData")}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Unique ID</TableHead><TableHead>Name</TableHead><TableHead>Children</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {parents.map((parent) => (
                    <TableRow key={parent.id}>
                      <TableCell className="font-medium">{parent.uniqueId}</TableCell>
                      <TableCell>{parent.name}</TableCell>
                      <TableCell>{parent.children.join(", ")}</TableCell>
                      <TableCell>{parent.phone}</TableCell>
                      <TableCell><Badge variant={parent.status === "ACTIVE" ? "default" : "secondary"}>{parent.status}</Badge></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm"><Eye className="mr-1 h-4 w-4" />View</Button>
                        <Button variant="ghost" size="sm"><MessageSquare className="mr-1 h-4 w-4" />Message</Button>
                      </TableCell>
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
