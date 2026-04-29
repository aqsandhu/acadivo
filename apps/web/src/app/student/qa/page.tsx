"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { mockApi } from "@/services/apiClient";
import type { QAItem } from "@/types";
import { HelpCircle, Globe, CheckCircle2 } from "lucide-react";

export default function StudentQAPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<QAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [subject, setSubject] = useState("Mathematics");

  useEffect(() => {
    mockApi.getQAItems().then((q) => { setItems(q); setLoading(false); });
  }, []);

  const ask = async () => {
    await mockApi.askQuestion({ question, subject, studentId: user?.id || "", studentName: user?.name || "" });
    alert("Question submitted!");
    setQuestion("");
  };

  return (
    <>
      <StudentSidebar />
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Ask Questions</h1>
          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold">Ask a New Question</h3>
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Select value={subject} onChange={(e) => setSubject(e.target.value)}>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                </Select>
              </div>
              <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Type your question..." rows={3} />
              <Button onClick={ask}><HelpCircle className="h-4 w-4 mr-2" /> Ask Question</Button>
            </CardContent>
          </Card>

          <h2 className="text-lg font-semibold">My Questions</h2>
          {loading ? <div className="space-y-3"><Skeleton className="h-32" /><Skeleton className="h-32" /></div> : (
            <div className="space-y-3">
              {items.map((q) => (
                <Card key={q.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{q.subject}</Badge>
                      <Badge variant={q.status === "answered" ? "default" : "outline"}>{q.status}</Badge>
                    </div>
                    <p className="font-medium mt-2">{q.question}</p>
                    {q.answer && (
                      <div className="mt-3 bg-muted/50 p-3 rounded-md text-sm">
                        <p className="text-muted-foreground">Answer:</p>
                        <p>{q.answer}</p>
                      </div>
                    )}
                    {q.isPublic && <span className="text-xs text-muted-foreground flex items-center gap-1 mt-2"><Globe className="h-3 w-3" /> Public</span>}
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
