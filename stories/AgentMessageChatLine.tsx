"use client";

import { agentMessageAiChatOutputSchema } from "@/lib/backend.types";
import { useAgentsByIdsQuery } from "@/lib/queries/agentQueries";
import { z } from "zod";
import { AgentChatLine } from "./AgentChatLine";

type AgentMessageProps = {
  message: z.infer<typeof agentMessageAiChatOutputSchema>;
  showSentiment?: boolean;
};

// Should never happen, even if the agent is SILENCED, originalMessages would be unaltered.
// But agents are unpredictable, it might decide to have an existential crisis and if the GM doesn't catch it, we have this fallback
const emptyMessageFallback = (agentName: string): React.ReactNode => {
  const fallbackMessages = [
    "{agentName} consulted with their alter ego",
    "{agentName} screamed internally",
    "{agentName} struck a pose",
    "{agentName} is hoping that you're having a good day and are being your best self. Unless you're not into that, in that case, they think you should get bent. Whatever.",
    "{agentName} is quietly plotting a coup, tomorrow",
    "{agentName} NOTHING IS PERMANENT, EVERYTHING DECAYS, AAAAAAAAAAAAAAAAAAAAAAH",
  ];
  return (
    <p className={"text-muted-foreground italic"}>
      {fallbackMessages[
        Math.floor(Math.random() * fallbackMessages.length)
      ].replace("{agentName}", agentName)}
    </p>
  );
};

export function AgentMessageChatLine({
  message,
  showSentiment = true,
}: AgentMessageProps) {
  // Memoize agent IDs since they won't change for a given message
  const allAgentIds = [
    message.content.senderId,
    ...message.content.originalTargets,
  ];

  const { data: agents, isLoading: isAgentsLoading } =
    useAgentsByIdsQuery(allAgentIds);

  // Memoize the sender agent to avoid finding it on every render
  const senderAgent = agents?.find((a) => a.id === message.content.senderId);

  if (isAgentsLoading) return null;
  if (!senderAgent) {
    console.log("Couldn't find sender agent", message.content.senderId);
    return null;
  }
  // We could even memoize messageContent if needed
  const messageContent = message.content.originalMessage
    ? message.content.originalMessage.content.text
    : emptyMessageFallback(senderAgent.display_name);

  return (
    <>
      {/* TODO: Render PvP status effects from message.content.pvpStatusEffects */}
      <AgentChatLine
        agentId={senderAgent.id}
        agentName={senderAgent.display_name}
        agentImageUrl={senderAgent.image_url}
        agentBorderColor={senderAgent.color}
        message={messageContent}
        showSentiment={showSentiment}
        isGM={false}
      />
    </>
  );
}
