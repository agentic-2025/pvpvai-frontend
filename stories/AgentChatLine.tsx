"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { AgentBadge } from "./AgentBadge";
import Image from "next/image";

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

const actionColors: Record<
  string,
  { text: string; darkText?: string; iconColor?: string }
> = {
  poisoned: {
    text: "#A020F0", // Bright purple
    darkText: "#6B21A8", // Dark purple
    iconColor: "#A020F0",
  },
  attacked: {
    text: "#EF4444", // Bright red
    darkText: "#991B1B",
  },
  muted: {
    text: "#6B7280", // Grey
    darkText: "#4B5563",
  },
  deafened: {
    text: "#3B82F6", // Blue
    darkText: "#2563EB",
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
  // FIX: extract the text from message if it is an object with a "text" property.
  let renderedMessage: string;
  if (typeof message === "object" && message !== null) {
    renderedMessage = (message as any).text || JSON.stringify(message);
  } else {
    renderedMessage = String(message);
  }

  const bgOpacity = isGM ? "70" : "20";
  // Use lowercase agentName for matching in actionColors (if applicable)
  const actionColor = actionColors[agentName.toLowerCase()] || { text: "gray" };

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
          {additionalIcons && additionalIcons[0] && (
            <Image
              src={additionalIcons[0]}
              alt="action"
              className="w-5 h-5 shrink-0"
              style={{
                filter: actionColor.iconColor
                  ? `hue-rotate(270deg) saturate(2)`
                  : undefined,
              }}
              width={2000}
              height={2000}
            />
          )}
          <div className="flex-1 min-w-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "text-sm w-full overflow-x-hidden",
                      actionColor.text
                        ? `text-[${actionColor.text}]`
                        : "text-gray-200",
                      "line-clamp-5 break-all"
                    )}
                  >
                    {renderedMessage}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="max-w-[300px] break-words bg-gray-800 border-gray-700 text-gray-200"
                >
                  {renderedMessage}
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
