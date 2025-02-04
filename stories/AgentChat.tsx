"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WsMessageTypes } from "@/lib/backend.types";
import { cn } from "@/lib/utils";
import { ReactNode, useLayoutEffect, useRef } from "react";
import { AgentChatLine } from "./AgentChatLine";
import { GMChatLine } from "./GMChatLine";
export interface AgentChatMessage {
  messageType:
    | WsMessageTypes.GM_MESSAGE
    | WsMessageTypes.AI_CHAT_AGENT_MESSAGE
    | WsMessageTypes.AI_CHAT_PVP_ACTION_ENACTED
    | WsMessageTypes.AI_CHAT_PVP_STATUS_REMOVED
    | WsMessageTypes.OBSERVATION;
  agentId: number;
  message: ReactNode;
  createdAt: string;
  agentDetails?: {
    id?: number;
    agents?: {
      id?: number;
      color?: string;
      image_url?: string;
      display_name?: string;
    };
  };
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
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom when agent messages update.
  useLayoutEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={cn("flex flex-col h-full w-full", className)}>
      {showHeader && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-gray-200">AI Agent Chat</h2>
        </div>
      )}
      <ScrollArea className="flex-1">
        <div className="flex flex-col divide-y divide-gray-800">
          {messages.map((msg, index) => {
            // Use fallback values in case agentDetails or its nested properties are missing.
            const agentDisplayName =
              msg.agentDetails?.agents?.display_name || "Unknown Agent";
            const agentImageUrl = msg.agentDetails?.agents?.image_url || "";
            const agentBorderColor =
              msg.agentDetails?.agents?.color || "#cccccc";

            console.log("msg", msg);
            console.log("msg", msg.messageType);
            if (msg.messageType === WsMessageTypes.GM_MESSAGE) {
              return <GMChatLine key={index} message={msg.message} />;
            } else {
              return (
                <AgentChatLine
                  key={index}
                  agentName={agentDisplayName}
                  agentImageUrl={agentImageUrl}
                  agentBorderColor={agentBorderColor}
                  message={msg.message}
                  sentiment={msg.sentiment}
                  showSentiment={showSentiment}
                  additionalIcons={msg.additionalIcons}
                />
              );
            }
          })}
          {/* Dummy element to scroll into view */}
          <div ref={endOfMessagesRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
