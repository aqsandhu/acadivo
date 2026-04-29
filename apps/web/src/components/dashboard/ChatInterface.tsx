"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Check, CheckCheck } from "lucide-react";
import { cn } from "@/utils/cn";
import type { MessageItem, Conversation } from "@/types";

interface ChatInterfaceProps {
  conversation: Conversation;
  messages: MessageItem[];
  onSendMessage: (content: string) => void;
  currentUserId: string;
}

export function ChatInterface({ conversation, messages, onSendMessage, currentUserId }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="border-b p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
          {conversation.participantName.charAt(0)}
        </div>
        <div>
          <p className="font-semibold">{conversation.participantName}</p>
          <p className="text-xs text-muted-foreground">{conversation.participantRole}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[70%] rounded-lg px-4 py-2 text-sm", isMe ? "bg-primary text-primary-foreground" : "bg-muted")}>
                <p>{msg.content}</p>
                <div className={cn("mt-1 flex items-center gap-1 text-[10px]", isMe ? "text-primary-foreground/70" : "text-muted-foreground")}>
                  <span>{msg.timestamp}</span>
                  {isMe && (msg.read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>
      <div className="border-t p-3 flex gap-2">
        <Button size="icon" variant="ghost"><Paperclip className="h-4 w-4" /></Button>
        <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Type a message..." className="flex-1" />
        <Button size="icon" onClick={handleSend}><Send className="h-4 w-4" /></Button>
      </div>
    </Card>
  );
}
