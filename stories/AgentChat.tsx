"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  agentDecisionAiChatOutputSchema,
  agentMessageAiChatOutputSchema,
  AllAiChatMessageSchemaTypes,
  gmMessageAiChatOutputSchema,
  isSupportedInAiChat,
  observationMessageAiChatOutputSchema,
  pvpActionEnactedAiChatOutputSchema,
  WsMessageTypes,
} from "@/lib/backend.types";
import { cn } from "@/lib/utils";
import { useLayoutEffect, useRef } from "react";
import { AgentDecisionChatLine } from "./AgentDecisionChatLine";
import { AgentMessageChatLine } from "./AgentMessageChatLine";
import { GMChatLine } from "./GMChatLine";
import { ObservationChatLine } from "./ObservationChatLine";
import { PvPActionChatLine } from "./PvPActionChatLine";

interface AgentChatProps {
  messages: AllAiChatMessageSchemaTypes[];
  showHeader?: boolean;
  className?: string;
  loading?: boolean;
  roundId?: number;
}

export function AgentChat({
  messages,
  showHeader = true,
  className,
  loading = false,
  roundId,
}: AgentChatProps) {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  console.log("🚀 ~ messages:", messages);
  // Scroll to the bottom when agent messages update.
  useLayoutEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <div className={cn("flex flex-col h-full w-full", className)}>
        {showHeader && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-gray-200">
              AI Agent Chat
            </h2>
          </div>
        )}
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-4 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full w-full relative", className)}>
      {showHeader && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-gray-200">AI Agent Chat</h2>
        </div>
      )}
      <ScrollArea className="flex-1">
        {messages.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-gray-400 text-center px-4 py-2 rounded-md bg-gray-900/90 border border-gray-800">
              Found no messages for round {roundId ?? "unknown"}
            </div>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-800">
            {messages
              .filter((msg) => {
                if (!isSupportedInAiChat(msg.messageType)) {
                  console.log("msg", msg);
                  console.log("msg.messageType", msg.messageType);
                  console.log("msg.messageType", msg["messageType"]);
                  console.log(
                    "Encountered unsupported message type, skipping: ",
                    msg.messageType
                  );
                  return false;
                }
                return true;
              })
              .map((msg, index) => {
                switch (msg.messageType) {
                  case WsMessageTypes.GM_MESSAGE:
                    const gmMessage = gmMessageAiChatOutputSchema.parse(msg);
                    return <GMChatLine key={index} message={gmMessage} />;
                  case WsMessageTypes.AGENT_DECISION:
                    const agentDecisionMessage =
                      agentDecisionAiChatOutputSchema.parse(msg);
                    return (
                      <AgentDecisionChatLine
                        key={index}
                        agent_id={agentDecisionMessage.content.agentId}
                        decision={agentDecisionMessage.content.decision}
                      />
                    );
                  case WsMessageTypes.AGENT_MESSAGE:
                    const agentMessage =
                      agentMessageAiChatOutputSchema.parse(msg);
                    return (
                      <AgentMessageChatLine
                        key={index}
                        message={agentMessage}
                      />
                    );
                  case WsMessageTypes.OBSERVATION:
                    const observationMessage =
                      observationMessageAiChatOutputSchema.parse(msg);
                    return (
                      <ObservationChatLine
                        key={index}
                        message={observationMessage}
                      />
                    );
                  case WsMessageTypes.PVP_ACTION_ENACTED:
                    const pvpActionEnactedMessage =
                      pvpActionEnactedAiChatOutputSchema.parse(msg);
                    return (
                      <PvPActionChatLine
                        key={index}
                        message={pvpActionEnactedMessage}
                      />
                    );
                }
              })}
            {/* Dummy element to scroll into view */}
            <div ref={endOfMessagesRef} />
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
