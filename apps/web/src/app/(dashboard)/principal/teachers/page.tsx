"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, GraduationCap, Eye, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useMockApi, getTeachers, type Teacher } from "@/services/apiClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PrincipalTeachersPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const { data: teachers, loading } = useMockApi(() => getTeachers({ search: search || undefined }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t("nav.teachers")}</h2>
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("common.search")} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : !teachers?.length ? (
            <div className="py-12 text-center text-muted-foreground">{t("common.noData")}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Unique ID</TableHead><TableHead>Name</TableHead><TableHead>Subjects</TableHead><TableHead>Classes</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">{teacher.uniqueId}</TableCell>
                      <TableCell>{teacher.name}</TableCell>
                      <TableCell>{teacher.subjects.join(", ")}</TableCell>
                      <TableCell>{teacher.assignedClasses.join(", ")}</TableCell>
                      <TableCell>{teacher.phone}</TableCell>
                      <TableCell><Badge variant={teacher.status === "ACTIVE" ? "default" : "secondary"}>{teacher.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedTeacher(teacher)}><Eye className="mr-1 h-4 w-4" />View</Button>
                          <Button variant="ghost" size="sm"><MessageSquare className="mr-1 h-4 w-4" />Message</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedTeacher} onOpenChange={(open) => { if (!open) setSelectedTeacher(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Teacher Details</DialogTitle></DialogHeader>
          {selectedTeacher && (
            <Tabs defaultValue="info">
              <TabsList><TabsTrigger value="info">Info</TabsTrigger><TabsTrigger value="classes">Classes</TabsTrigger><TabsTrigger value="subjects">Subjects</TabsTrigger></TabsList>
              <TabsContent value="info" className="space-y-3 py-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><div className="text-muted-foreground">Name</div><div>{selectedTeacher.name}</div></div>
                  <div><div className="text-muted-foreground">Email</div><div>{selectedTeacher.email}</div></div>
                  <div><div className="text-muted-foreground">Phone</div><div>{selectedTeacher.phone}</div></div>
                  <div><div className="text-muted-foreground">Qualifications</div><div>{selectedTeacher.qualifications}</div></div>
                </div>
              </TabsContent>
              <TabsContent value="classes"><div className="py-4">{selectedTeacher.assignedClasses.map((c) => <Badge key={c} className="mr-2">{c}</Badge>)}</div></TabsContent>
              <TabsContent value="subjects"><div className="py-4">{selectedTeacher.subjects.map((s) => <Badge key={s} className="mr-2">{s}</Badge>)}</div></TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
