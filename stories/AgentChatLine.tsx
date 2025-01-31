import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { AgentBadge } from "./AgentBadge";

interface AgentChatLineProps {
  agentName: string;
  agentImageUrl?: string;
  agentBorderColor: string;
  badgeBorderColor?: string;
  message: ReactNode;
  sentiment?: string;
  showSentiment?: boolean;
  isGM?: boolean;
  creatorAddress?: string;
  popularity?: number;
  additionalIcons?: string[];
}

const actionColors = {
  poisoned: {
    text: "#A020F0", // Bright purple
    darkText: "#6B21A8", // Dark purple
    iconColor: "#A020F0", // Purple for SVG
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

export function AgentChatLine({
  agentName,
  agentImageUrl,
  agentBorderColor,
  badgeBorderColor,
  message,
  sentiment,
  showSentiment = true,
  isGM = false,
  creatorAddress,
  popularity,
  additionalIcons,
}: AgentChatLineProps) {
  const bgOpacity = isGM ? "70" : "20";
  const isPvP = agentName === "PvP";
  const actionIcon = isPvP && additionalIcons?.[0];
  const isLightBg = parseInt(bgOpacity, 10) > 50;

  // Style the message if it's a PvP action
  const styledMessage = message;

  return (
    <div className="flex items-stretch gap-2 py-1 px-2">
      <div className="flex flex-col items-end gap-0.5 w-[140px] shrink-0">
        <AgentBadge
          id={agentName}
          name={agentName}
          color={agentBorderColor}
          borderColor={badgeBorderColor}
          variant="sm"
          avatar={agentImageUrl}
          creatorAddress={creatorAddress || "0x0"}
          popularity={popularity}
          additionalIcons={additionalIcons}
        />
      </div>
      <div
        className="flex-1 min-w-0 rounded px-3 py-1"
        style={{
          backgroundColor: `${agentBorderColor}${bgOpacity}`,
          border: `2px solid ${agentBorderColor}45`,
        }}
      >
        <div className="flex items-center gap-2">
          {actionIcon && (
            <img
              src={actionIcon}
              alt="action"
              className="w-5 h-5 shrink-0"
              style={{
                filter: message?.toString().includes("poisoned")
                  ? "hue-rotate(270deg) saturate(2)"
                  : undefined,
              }}
            />
          )}
          <div className="flex-1 min-w-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "text-sm text-gray-200",
                      "line-clamp-5 break-words"
                    )}
                  >
                    {styledMessage}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="max-w-[300px] break-words bg-gray-800 border-gray-700 text-gray-200"
                >
                  {message}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      {showSentiment && sentiment && (
        <div className="w-14 text-xs text-gray-400 text-left shrink-0 truncate">
          {sentiment}
        </div>
      )}
    </div>
  );
}
