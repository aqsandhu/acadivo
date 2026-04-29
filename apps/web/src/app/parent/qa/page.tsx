"use client";

import { useEffect, useState } from "react";
import { ParentSidebar } from "@/components/layout/ParentSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { mockApi } from "@/services/apiClient";
import type { QAItem, ChildProfile } from "@/types";
import { HelpCircle, MessageCircle } from "lucide-react";

export default function ParentQAPage() {
  const [items, setItems] = useState<QAItem[]>([]);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [q, c] = await Promise.all([mockApi.getQAItems(), mockApi.getChildren()]);
      setItems(q);
      setChildren(c);
      if (c.length > 0) setSelectedChild(c[0].id);
      setLoading(false);
    }
    load();
  }, []);

  const ask = async () => {
    await mockApi.askQuestion({ question, studentId: selectedChild, studentName: children.find((c) => c.id === selectedChild)?.name || "" });
    alert("Question sent to teacher!");
    setQuestion("");
  };

  return (
    <>
      <ParentSidebar />
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Ask Teacher</h1>
          <Card>
            <CardContent className="p-5 space-y-4">
              <div>
                <Label>Select Child</Label>
                <Select value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)}>
                  {children.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </Select>
              </div>
              <div>
                <Label>Teacher</Label>
                <Select>
                  <SelectItem value="">Select a teacher</SelectItem>
                  {items.filter((i) => i.teacherId && i.teacherName)
                    .map((i) => ({ id: i.teacherId!, name: i.teacherName! }))
                    .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
                    .map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </Select>
              </div>
              <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Type your question..." rows={3} />
              <Button onClick={ask}><HelpCircle className="h-4 w-4 mr-2" /> Send Question</Button>
            </CardContent>
          </Card>

          <h2 className="text-lg font-semibold">History</h2>
          {loading ? <div className="space-y-3"><Skeleton className="h-32" /><Skeleton className="h-32" /></div> : (
            <div className="space-y-3">
              {items.map((q) => (
                <Card key={q.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-primary" />
                      <p className="font-medium">{q.question}</p>
                    </div>
                    {q.answer && (
                      <div className="mt-2 bg-muted/50 p-3 rounded-md text-sm">
                        <p className="text-muted-foreground">Answer from {q.teacherName}:</p>
                        <p>{q.answer}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
