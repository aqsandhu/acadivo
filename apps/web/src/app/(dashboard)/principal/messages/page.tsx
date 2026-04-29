"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageSquare, Send, Search, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMockApi, getConversations, getMessages, type Conversation, type Message } from "@/services/apiClient";

export default function PrincipalMessagesPage() {
  const { t } = useTranslation();
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState("");
  const { data: conversations, loading: convLoading } = useMockApi(getConversations);
  const { data: messages, loading: msgLoading } = useMockApi(() => getMessages(selectedConv?.id));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t("nav.messages")}</h2>
      <div className="grid gap-4 md:grid-cols-3 h-[calc(100vh-12rem)]">
        {/* Conversation List */}
        <Card className="md:col-span-1 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Conversations</CardTitle>
            <Button variant="ghost" size="icon"><Plus className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent className="space-y-2 overflow-y-auto p-0">
            {convLoading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 mx-4" />)
            ) : (
              conversations?.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors ${selectedConv?.id === conv.id ? "bg-muted" : ""}`}
                >
                  <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {conv.participantName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate">{conv.participantName}</span>
                      {conv.unreadCount > 0 && <Badge variant="default" className="text-xs">{conv.unreadCount}</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{conv.lastMessage}</div>
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Chat */}
        <Card className="md:col-span-2 flex flex-col overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="text-sm">{selectedConv ? selectedConv.participantName : "Select a conversation"}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            {msgLoading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)
            ) : selectedConv ? (
              messages?.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderId === "me" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] rounded-lg px-4 py-2 text-sm ${msg.senderId === "me" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <div>{msg.content}</div>
                    <div className={`text-xs mt-1 ${msg.senderId === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">Select a conversation to start messaging</div>
            )}
          </CardContent>
          <div className="border-t p-4 flex gap-2">
            <Input placeholder="Type a message..." value={messageText} onChange={(e) => setMessageText(e.target.value)} />
            <Button size="icon"><Send className="h-4 w-4" /></Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
