"use client"
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { AgentChatLine } from "./AgentChatLine";

export interface AgentChatMessage {
  agentId: number;
  message: ReactNode;
  createdAt: string;
  agentDetails: {
    id: number;
    agents: {
      id: number;
      color: string;
      image_url: string;
      display_name: string;
    };
  };
}

interface AgentChatProps {
  messages: AgentChatMessage[];
  showHeader?: boolean;
  showSentiment?: boolean;
  className?: string;
}

export function AgentChat({
  messages,
  showHeader = true,
  showSentiment = true,
  className,
}: AgentChatProps) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {showHeader && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-gray-200">AI Agent Chat</h2>
        </div>
      )}
      <ScrollArea className="flex-1">
        <div className="flex flex-col divide-y divide-gray-800">
          {messages.map((msg, index) => (
            <AgentChatLine
              key={index}
              agentName={msg.agentDetails.agents.display_name}
              agentImageUrl={msg.agentDetails.agents.image_url}
              agentBorderColor={msg.agentDetails.agents.color}
              message={msg.message}
              createdAt={msg.createdAt}
              sentiment={msg.sentiment}
              showSentiment={showSentiment}
              additionalIcons={msg.additionalIcons}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
