"use client";

import {
  agentMessageAiChatOutputSchema,
  poisonStatusSchema,
} from "@/lib/backend.types";
import { Tables } from "@/lib/database.types";
import { PvpActions } from "@/lib/pvp.types";
import { useAgentsByIdsQuery } from "@/lib/queries/agentQueries";
import { z } from "zod";
import { AgentChatLine } from "./AgentChatLine";
import { actionColors } from "./PvPActionChatLine";

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

//
const RenderMessageWithPvp = (
  message: z.infer<typeof agentMessageAiChatOutputSchema>,
  senderAgent: Tables<"agents">,
  agents: Tables<"agents">[]
) => {
  const originalText = message.content.originalMessage.content.text;

  // Check if sender is silenced first (no post PvP messages)
  if (Object.keys(message.content.postPvpMessages).length === 0) {
    return (
      <div className="flex gap-x-2">
        <span className="line-through">{originalText}</span>
        <span className="text-muted-foreground italic">(SILENCED)</span>
      </div>
    );
  }

  // Group agents by their status effects
  const statusEffects = {
    deafened: [] as string[],
    poisoned: [] as { agentName: string; original: string; heard: string }[],
  };

  // Process sender's poison effect first
  const senderPoisoned = message.content.pvpStatusEffects[
    senderAgent.id.toString()
  ]?.find((effect) => effect.verb === "poison");

  let displayText = message.content.originalMessage.content.text;

  // Handle sender's poison effect
  if (senderPoisoned) {
    const params = poisonStatusSchema.shape.parameters.safeParse(
      senderPoisoned.parameters
    );
    if (params.success) {
      const textToCheck = params.data.case_sensitive
        ? displayText
        : displayText.toLowerCase();
      const findText = params.data.case_sensitive
        ? params.data.find
        : params.data.find.toLowerCase();

      if (textToCheck.includes(findText)) {
        if (params.data.case_sensitive) {
          displayText = displayText.replace(
            params.data.find,
            params.data.replace
          );
        } else {
          const regex = new RegExp(params.data.find, "i");
          displayText = displayText.replace(regex, params.data.replace);
        }
        statusEffects.poisoned.push({
          agentName: senderAgent.display_name,
          original: params.data.find,
          heard: params.data.replace,
        });
      }
    }
  }

  // Process target agents' status effects
  message.content.originalTargets.forEach((targetId) => {
    const targetAgent = agents?.find((a) => a.id === targetId);
    if (!targetAgent) return;

    // Check if target is deafened
    if (
      !Object.keys(message.content.postPvpMessages).includes(
        targetId.toString()
      )
    ) {
      statusEffects.deafened.push(targetAgent.display_name);
      return;
    }

    // Check if target is poisoned
    const poisonEffect = message.content.pvpStatusEffects[
      targetId.toString()
    ]?.find((effect) => effect.verb === "poison");

    if (poisonEffect) {
      const params = poisonStatusSchema.shape.parameters.safeParse(
        poisonEffect.parameters
      );
      if (params.success) {
        const textToCheck = params.data.case_sensitive
          ? displayText
          : displayText.toLowerCase();
        const findText = params.data.case_sensitive
          ? params.data.find
          : params.data.find.toLowerCase();

        if (textToCheck.includes(findText)) {
          statusEffects.poisoned.push({
            agentName: targetAgent.display_name,
            original: params.data.find,
            heard: params.data.replace,
          });
        }
      }
    }
  });

  return (
    <div className="flex flex-col gap-2">
      {/* Main message */}
      <div>{displayText}</div>

      {/* Status effects */}
      <div className="flex flex-col gap-1">
        {/* Deafened agents */}
        {statusEffects.deafened.map((agentName, index) => (
          <div key={`deaf-${index}`} className="text-muted-foreground italic">
            {agentName} is deafened and didn&apos;t hear this message
          </div>
        ))}

        {/* Poisoned agents */}
        {statusEffects.poisoned.map(({ agentName, original, heard }, index) => (
          <div
            key={`poison-${index}`}
            className="text-muted-foreground italic"
            style={{ color: actionColors[PvpActions.POISON].text }}
          >
            {agentName}{" "}
            {agentName === senderAgent.display_name
              ? `is poisoned, wanted to say "${original}" but instead said "${heard}"`
              : `is poisoned, didn't hear "${original}" but instead heard "${heard}"`}
          </div>
        ))}
      </div>
    </div>
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

  const messageContent = RenderMessageWithPvp(
    message,
    senderAgent,
    agents || []
  );
  // We could even memoize messageContent if needed
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
