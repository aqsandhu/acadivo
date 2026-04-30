"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Users, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectOption } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useMockApi, getStudents, type Student } from "@/services/apiClient";

export default function PrincipalStudentsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const { data: students, loading } = useMockApi(() =>
    getStudents({ search: search || undefined, class: classFilter || undefined, section: sectionFilter || undefined })
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t("nav.students")}</h2>
      <Card>
        <CardContent className="flex flex-wrap gap-4 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("common.search")} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={classFilter} onValueChange={(value) => setClassFilter(value)}>
            <SelectOption value="">All Classes</SelectOption>
            {Array.from({ length: 10 }).map((_, i) => <SelectOption key={i} value={`Class ${i + 1}`}>Class {i + 1}</SelectOption>)}
          </Select>
          <Select value={sectionFilter} onValueChange={(value) => setSectionFilter(value)}>
            <SelectOption value="">All Sections</SelectOption>
            <SelectOption value="A">A</SelectOption>
            <SelectOption value="B">B</SelectOption>
            <SelectOption value="C">C</SelectOption>
          </Select>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : !students?.length ? (
            <div className="py-12 text-center text-muted-foreground">{t("common.noData")}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Unique ID</TableHead><TableHead>Name</TableHead><TableHead>Class</TableHead><TableHead>Section</TableHead><TableHead>Roll #</TableHead><TableHead>Parent</TableHead><TableHead>Attendance</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.uniqueId}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell>{student.section}</TableCell>
                      <TableCell>{student.rollNumber}</TableCell>
                      <TableCell>{student.parentName}</TableCell>
                      <TableCell>{student.attendancePercent}%</TableCell>
                      <TableCell><Badge variant={student.status === "ACTIVE" ? "default" : "secondary"}>{student.status}</Badge></TableCell>
                      <TableCell><Button variant="ghost" size="sm" onClick={() => setSelectedStudent(student)}><Eye className="mr-1 h-4 w-4" />View</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedStudent} onOpenChange={(open) => { if (!open) setSelectedStudent(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Student Details</DialogTitle></DialogHeader>
          {selectedStudent && (
            <div className="grid grid-cols-2 gap-4 py-4 text-sm">
              <div><div className="text-muted-foreground">Name</div><div>{selectedStudent.name}</div></div>
              <div><div className="text-muted-foreground">Class</div><div>{selectedStudent.class} - {selectedStudent.section}</div></div>
              <div><div className="text-muted-foreground">Roll #</div><div>{selectedStudent.rollNumber}</div></div>
              <div><div className="text-muted-foreground">Attendance</div><div>{selectedStudent.attendancePercent}%</div></div>
              <div><div className="text-muted-foreground">Parent</div><div>{selectedStudent.parentName}</div></div>
              <div><div className="text-muted-foreground">Parent Phone</div><div>{selectedStudent.parentPhone}</div></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
