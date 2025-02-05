import { gmMessageAiChatOutputSchema } from "@/lib/backend.types";
import { useAgentQuery, useAgentsByIdsQuery } from "@/lib/queries/agentQueries";
import { FC } from "react";
import { z } from "zod";
import { AgentAvatar } from "./AgentAvatar";
import { AgentChatLine } from "./AgentChatLine";
import Gavel from "./assets/pvp/gavel.svg";

interface GMChatLineProps {
  message: z.infer<typeof gmMessageAiChatOutputSchema>;
}

export const GMChatLine: FC<GMChatLineProps> = ({ message }) => {
  const gmColor = "#D4AF37";

  // Extract GM ID and target IDs from message
  const gmAgent = message.content.gmId;
  const targets = message.content.targets; // Already an array of numbers, no need to map

  // Fetch GM agent data
  const { data: gmData, isLoading: isLoadingGM } = useAgentQuery(gmAgent);

  // Fetch target agents data, has some caching tricks to avoid refetching the same agent multiple times
  const { data: targetAgents, isLoading: isLoadingTargets } =
    useAgentsByIdsQuery(targets);

  if (isLoadingGM || isLoadingTargets) {
    return <div>Loading...</div>;
  }

  if (!gmData) {
    return <div>Error: GM agent not found</div>;
  }

  const messageContent = (
    <div className="flex flex-col gap-1">
      <div className="text-white">{message.content.message}</div>
      <div className="flex justify-end items-center gap-2">
        <span className="text-xs text-gray-400">Sent to:</span>
        <div className="flex gap-1">
          {targetAgents?.map((target) => (
            <AgentAvatar
              key={target.id}
              imageUrl={target.image_url}
              variant="xxs"
              borderColor={target.color}
              name={target.display_name}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <AgentChatLine
      agentId={gmAgent}
      agentName={gmData.display_name}
      agentImageUrl={gmData.image_url}
      agentBorderColor={gmColor}
      message={messageContent}
      showSentiment={false}
      badgeBorderColor={"#000"}
      backgroundIcon={Gavel.src}
      isGM={true}
      creatorAddress="0x0000000000000000000000000000000000000000"
    />
  );
};
