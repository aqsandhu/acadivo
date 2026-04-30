"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Users, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectOption } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApi, getUsers, type User } from "@/services/apiClient";

export default function UsersPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: users, loading } = useApi(() =>
    getUsers({ search: search || undefined, role: roleFilter || undefined, status: statusFilter || undefined })
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t("nav.users")}</h2>
      <Card>
        <CardContent className="flex flex-wrap gap-4 p-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t("common.search")} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value)}>
            <SelectOption value="">All Roles</SelectOption>
            <SelectOption value="ADMIN">Admin</SelectOption>
            <SelectOption value="TEACHER">Teacher</SelectOption>
            <SelectOption value="STUDENT">Student</SelectOption>
            <SelectOption value="PARENT">Parent</SelectOption>
            <SelectOption value="PRINCIPAL">Principal</SelectOption>
          </Select>
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
          ) : !users?.length ? (
            <div className="py-12 text-center text-muted-foreground">{t("common.noData")}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Role</TableHead><TableHead>School</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                      <TableCell>{user.schoolName || "—"}</TableCell>
                      <TableCell><Badge variant={user.status === "ACTIVE" ? "default" : "secondary"}>{user.status}</Badge></TableCell>
                      <TableCell><Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}><Eye className="mr-1 h-4 w-4" />View</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedUser} onOpenChange={(open) => { if (!open) setSelectedUser(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>User Details</DialogTitle></DialogHeader>
          {selectedUser && (
            <div className="space-y-3 py-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold">
                  {selectedUser.name.charAt(0)}
                </div>
                <div><div className="font-semibold">{selectedUser.name}</div><div className="text-sm text-muted-foreground">{selectedUser.email}</div></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><div className="text-muted-foreground">Phone</div><div>{selectedUser.phone}</div></div>
                <div><div className="text-muted-foreground">Role</div><div>{selectedUser.role}</div></div>
                <div><div className="text-muted-foreground">School</div><div>{selectedUser.schoolName || "—"}</div></div>
                <div><div className="text-muted-foreground">Status</div><div>{selectedUser.status}</div></div>
                <div><div className="text-muted-foreground">Joined</div><div>{new Date(selectedUser.createdAt).toLocaleDateString()}</div></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
