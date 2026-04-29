"use client";

import { useEffect, useState } from "react";
import { ParentSidebar } from "@/components/layout/ParentSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MessageThreadList } from "@/components/dashboard/MessageThreadList";
import { ChatInterface } from "@/components/dashboard/ChatInterface";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { mockApi } from "@/services/mockApi";
import type { Conversation, MessageItem } from "@/types";
import { Plus } from "lucide-react";

export default function ParentMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockApi.getConversations().then((c) => { setConversations(c); setLoading(false); });
  }, []);

  const loadMessages = async (conv: Conversation) => {
    setActiveConv(conv);
    const msgs = await mockApi.getMessages(conv.id);
    setMessages(msgs);
  };

  const sendMessage = async (content: string) => {
    if (!activeConv) return;
    const msg = await mockApi.sendMessage({ content, receiverId: activeConv.participantId });
    setMessages((prev) => [...prev, msg]);
  };

  return (
    <>
      <ParentSidebar />
      <DashboardLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Messages</h1>
            <Button><Plus className="h-4 w-4 mr-2" /> New Message</Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              {loading ? <Skeleton className="h-96" /> : (
                <MessageThreadList conversations={conversations} activeId={activeConv?.id} onSelect={loadMessages} />
              )}
            </div>
            <div className="lg:col-span-2">
              {activeConv ? (
                <ChatInterface conversation={activeConv} messages={messages} onSendMessage={sendMessage} currentUserId="PAR-001" />
              ) : (
                <div className="h-[600px] flex items-center justify-center text-muted-foreground border rounded-xl bg-muted/30">
                  Select a conversation to start chatting
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
