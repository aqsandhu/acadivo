"use client";

import { useEffect, useState } from "react";
import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { mockApi } from "@/services/apiClient";
import type { QAItem } from "@/types";
import { HelpCircle, CheckCircle2, Globe } from "lucide-react";

export default function TeacherQAPage() {
  const [items, setItems] = useState<QAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<QAItem | null>(null);
  const [answer, setAnswer] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    mockApi.getQAItems().then((q) => { setItems(q); setLoading(false); });
  }, []);

  const submitAnswer = async () => {
    if (!selected) return;
    await mockApi.answerQuestion(selected.id, answer, isPublic);
    alert("Answer submitted!");
    setSelected(null);
    setAnswer("");
    setIsPublic(false);
  };

  return (
    <>
      <TeacherSidebar />
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Q&A with Students</h1>
          {loading ? (
            <div className="space-y-3">
              {[1,2].map(i => <Skeleton key={i} className="h-32" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Pending Questions</h2>
                {items.filter((q) => q.status === "pending").map((q) => (
                  <Card key={q.id} className="cursor-pointer hover:shadow-md" onClick={() => { setSelected(q); setAnswer(""); }}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{q.studentName}</p>
                        <Badge variant="secondary">{q.subject}</Badge>
                      </div>
                      <p className="text-sm mt-2">{q.question}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(q.createdAt).toLocaleDateString()}</p>
                    </CardContent>
                  </Card>
                ))}
                <h2 className="text-lg font-semibold mt-4">Answered (Public)</h2>
                {items.filter((q) => q.isPublic && q.status === "answered").map((q) => (
                  <Card key={q.id} className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        <p className="font-medium">{q.question}</p>
                      </div>
                      <p className="text-sm mt-2 text-muted-foreground">{q.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div>
                {selected && (
                  <Card>
                    <CardContent className="p-5 space-y-4">
                      <h3 className="font-semibold">Answer Question</h3>
                      <div className="bg-muted p-3 rounded-md text-sm"><strong>Q:</strong> {selected.question}</div>
                      <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Write your answer..." rows={5} />
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="rounded border-input" />
                        Make public for class
                      </label>
                      <Button onClick={submitAnswer} className="w-full"><CheckCircle2 className="h-4 w-4 mr-2" /> Submit Answer</Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
