"use client";

import { cn } from "@/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Conversation } from "@/types";

interface MessageThreadListProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (conv: Conversation) => void;
}

export function MessageThreadList({ conversations, activeId, onSelect }: MessageThreadListProps) {
  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No conversations yet
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv) => (
        <Card
          key={conv.id}
          className={cn("cursor-pointer transition-colors", activeId === conv.id ? "border-primary bg-primary/5" : "hover:bg-muted/50")}
          onClick={() => onSelect(conv)}
        >
          <CardContent className="p-3 flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary text-sm">{conv.participantName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm truncate">{conv.participantName}</p>
                {conv.unreadCount > 0 && (
                  <Badge variant="default" className="text-[10px] h-5 min-w-[20px] justify-center">{conv.unreadCount}</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{conv.lastMessageTime}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
