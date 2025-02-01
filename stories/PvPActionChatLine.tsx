import { FC, ReactNode } from "react";
import { AgentChatLine } from "./AgentChatLine";
import { PlayerAddressChip } from "./PlayerAddressChip";
import Deafen from "./assets/pvp/deafen.svg";
import Knife from "./assets/pvp/knife.svg";
import Poison from "./assets/pvp/poison.svg";
import PvPActionIcon from "./assets/pvp/pvp-color2.svg";
import Silence from "./assets/pvp/silence.svg";

type PvPAction = "attack" | "mute" | "deafen" | "poison";

const actionToIcon: Record<PvPAction, string> = {
  attack: Knife.src,
  mute: Silence.src,
  deafen: Deafen.src,
  poison: Poison.src,
};

const actionToVerb: Record<PvPAction, string> = {
  attack: "attacked",
  mute: "muted",
  deafen: "deafened",
  poison: "poisoned",
};

const actionColors = {
  poisoned: {
    text: "#A020F0", // Bright purple
    darkText: "#6B21A8", // Dark purple
  },
  attacked: {
    text: "#EF4444", // Bright red
    darkText: "#991B1B", // Dark red
  },
  muted: {
    text: "#6B7280", // Grey
    darkText: "#4B5563", // Dark grey
  },
  deafened: {
    text: "#3B82F6", // Blue
    darkText: "#2563EB", // Dark blue
  },
};

interface PvPActionChatLineProps {
  action: PvPAction;
  instigator: string;
  targets: string[];
  description: string;
  message?: ReactNode;
  sentiment?: string;
  showSentiment?: boolean;
}

export const PvPActionChatLine: FC<PvPActionChatLineProps> = ({
  action,
  instigator,
  targets,
  description,
  message,
  sentiment,
  showSentiment,
}) => {
  const verb = actionToVerb[action];
  const actionColor = actionColors[verb as keyof typeof actionColors];

  const defaultMessage = (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <PlayerAddressChip address={instigator} variant="small" />
        <span className="font-bold italic" style={{ color: actionColor.text }}>
          {verb}
        </span>
        <span>{targets.join(", ")}</span>
      </div>
      <div className="text-sm text-gray-400">{description}</div>
    </div>
  );

  return (
    <AgentChatLine
      agentName="PvP"
      agentImageUrl={PvPActionIcon.src}
      agentBorderColor="#EEEEEE"
      message={message || defaultMessage}
      sentiment={sentiment}
      showSentiment={showSentiment}
      additionalIcons={[actionToIcon[action]]}
    />
  );
};
