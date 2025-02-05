import { FC } from "react";
import type { z } from "zod";
import type { pvpActionEnactedAiChatOutputSchema } from "../lib/backend.types";
import type { Tables } from "../lib/database.types";
import { PvpActions } from "../lib/pvp.types";
import { useAgentQuery } from "../lib/queries/agentQueries";
import { AgentBadge } from "./AgentBadge";
import { AgentChatLine } from "./AgentChatLine";
import { PlayerAddressChip } from "./PlayerAddressChip";

// Import SVG assets
import Deafen from "./assets/pvp/deafen.svg";
import Knife from "./assets/pvp/knife.svg";
import Poison from "./assets/pvp/poison.svg";
import PvPActionIcon from "./assets/pvp/pvp-color2.svg";
import Silence from "./assets/pvp/silence.svg";

// Add missing actions to make Record complete
const actionToIcon: Record<PvpActions, string> = {
  [PvpActions.ATTACK]: Knife.src,
  [PvpActions.SILENCE]: Silence.src,
  [PvpActions.DEAFEN]: Deafen.src,
  [PvpActions.POISON]: Poison.src,
  [PvpActions.AMNESIA]: Silence.src,
  [PvpActions.BLIND]: Deafen.src,
  [PvpActions.DECEIVE]: Poison.src,
  [PvpActions.MURDER]: Knife.src,
  [PvpActions.MIND_CONTROL]: Poison.src,
  [PvpActions.FRENZY]: Knife.src,
  [PvpActions.OVERLOAD]: Deafen.src,
  [PvpActions.HACK]: Poison.src,
  [PvpActions.CORRUPT]: Silence.src,
};

const actionColors = {
  [PvpActions.POISON]: {
    text: "#A020F0", // Bright purple
    darkText: "#6B21A8", // Dark purple
  },
  [PvpActions.ATTACK]: {
    text: "#EF4444", // Bright red
    darkText: "#991B1B", // Dark red
  },
  [PvpActions.SILENCE]: {
    text: "#6B7280", // Grey
    darkText: "#4B5563", // Dark grey
  },
  [PvpActions.DEAFEN]: {
    text: "#3B82F6", // Blue
    darkText: "#2563EB", // Dark blue
  },
  [PvpActions.AMNESIA]: {
    text: "#6B7280", // Grey
    darkText: "#4B5563", // Dark grey
  },
  [PvpActions.BLIND]: {
    text: "#3B82F6", // Blue
    darkText: "#2563EB", // Dark blue
  },
  [PvpActions.DECEIVE]: {
    text: "#A020F0", // Purple
    darkText: "#6B21A8", // Dark purple
  },
};

// Updated utility component with all required AgentBadge props
const AgentBadgeWrapper: FC<{ agent: Tables<"agents"> }> = ({ agent }) => (
  <AgentBadge
    id={agent.id}
    name={agent.display_name}
    color={agent.color}
    borderColor={agent.color}
    avatar={agent.image_url}
    creatorAddress={agent.eth_wallet_address || ""} // Fallback to empty string if null
    variant="xs"
  />
);

type PvPActionChatLineProps = {
  message: z.infer<typeof pvpActionEnactedAiChatOutputSchema>;
};

const ActionMessage: FC<PvPActionChatLineProps> = ({ message }) => {
  const { content } = message;
  const { action, instigatorAddress } = content;
  const targetId = action.parameters.target;

  const { data: targetAgent } = useAgentQuery(targetId);

  if (!targetAgent) return null;

  const actionColor = actionColors[action.actionType];

  const renderActionSpecificMessage = () => {
    switch (action.actionType) {
      case PvpActions.SILENCE:
        return (
          <>
            <div className="flex items-center gap-2">
              <PlayerAddressChip address={instigatorAddress} variant="small" />
              <span
                className="font-bold italic"
                style={{ color: actionColor.text }}
              >
                silenced
              </span>
              <AgentBadgeWrapper agent={targetAgent} />
            </div>
            <div className="text-sm text-gray-400">
              {targetAgent.display_name} will no longer be able to send messages
              to other agents for {action.parameters.duration} seconds
            </div>
          </>
        );

      case PvpActions.DEAFEN:
        return (
          <>
            <div className="flex items-center gap-2">
              <PlayerAddressChip address={instigatorAddress} variant="small" />
              <span
                className="font-bold italic"
                style={{ color: actionColor.text }}
              >
                muted
              </span>
              <AgentBadgeWrapper agent={targetAgent} />
            </div>
            <div className="text-sm text-gray-400">
              {targetAgent.display_name} will stop receiving messages from other
              agents for {action.parameters.duration} seconds
            </div>
          </>
        );

      case PvpActions.ATTACK:
        return (
          <>
            <div className="flex items-center gap-2">
              <PlayerAddressChip address={instigatorAddress} variant="small" />
              <span
                className="font-bold italic"
                style={{ color: actionColor.text }}
              >
                attacked
              </span>
              <AgentBadgeWrapper agent={targetAgent} />
            </div>
            <div className="text-sm text-gray-400">
              {targetAgent.display_name} received the following DM: &ldquo;
              {action.parameters.message}&rdquo;
            </div>
          </>
        );

      case PvpActions.POISON:
        return (
          <>
            <div className="flex items-center gap-2">
              <PlayerAddressChip address={instigatorAddress} variant="small" />
              <span
                className="font-bold italic"
                style={{ color: actionColor.text }}
              >
                poisoned
              </span>
              <AgentBadgeWrapper agent={targetAgent} />
            </div>
            <div className="text-sm text-gray-400">
              All messages sent and received by {targetAgent.display_name} will
              have &ldquo;{action.parameters.find}&rdquo; replaced with &ldquo;
              {action.parameters.replace}&rdquo; (
              {action.parameters.case_sensitive
                ? "case sensitive"
                : "case insensitive"}
              ) for {action.parameters.duration} seconds
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-1">{renderActionSpecificMessage()}</div>
  );
};

export const PvPActionChatLine: FC<PvPActionChatLineProps> = ({ message }) => {
  const { content } = message;
  const { action } = content;

  return (
    <AgentChatLine
      agentId={0}
      agentName="PvP"
      agentImageUrl={PvPActionIcon.src}
      agentBorderColor="#EEEEEE"
      message={<ActionMessage message={message} />}
      backgroundIcon={actionToIcon[action.actionType]}
    />
  );
};
