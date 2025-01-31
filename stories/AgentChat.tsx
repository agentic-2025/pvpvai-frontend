import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { AgentChatLine } from "./AgentChatLine";

export interface AgentChatMessage {
  agentName: string;
  agentImageUrl?: string;
  agentBorderColor: string;
  message: ReactNode;
  sentiment?: string;
  additionalIcons?: string[];
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
              agentName={msg.agentName}
              agentImageUrl={msg.agentImageUrl}
              agentBorderColor={msg.agentBorderColor}
              message={msg.message}
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
