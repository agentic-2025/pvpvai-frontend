"use client";

/*
  Agent chat line is the base class used to consistently style all chat line variants
  that appear in AI Chat. You will generally never want to use this component directly,
  instead use one of the components that use is, likee GMChatLine, PvpActionChatLine, etc.
*/
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";
import { AgentBadge } from "./AgentBadge";

interface AgentChatLineProps {
  agentId: number;
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
  backgroundIcon?: string;
  backgroundImageOpacity?: number;
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
  agentId,
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
  backgroundIcon,
  backgroundImageOpacity,
}: AgentChatLineProps) {
  let renderedMessage: string | ReactNode = message;
  if (typeof message === "object" && message !== null && "text" in message) {
    renderedMessage = (message as { text: string }).text;
  } else if (typeof message !== "string" && !React.isValidElement(message)) {
    // Only stringify primitive values, not React elements
    renderedMessage = String(message);
  }

  const defaultOpacity = isGM ? 70 : 20;
  const finalOpacity = backgroundImageOpacity ?? defaultOpacity;

  // Use lowercase agentName for matching in actionColors (if applicable)
  const actionColor = actionColors[agentName.toLowerCase()] || { text: "gray" };

  return (
    <div className="flex items-stretch gap-2 py-1 px-2">
      <div className="flex flex-col items-end gap-0.5 w-[140px] shrink-0">
        <AgentBadge
          id={agentId}
          name={agentName}
          color={agentBorderColor}
          borderColor={badgeBorderColor}
          variant="md"
          avatar={agentImageUrl}
          creatorAddress={creatorAddress || "0x0"}
          popularity={popularity}
        />
      </div>
      <div
        className="flex-1 min-w-0 rounded px-3 py-1 relative overflow-hidden"
        style={{
          backgroundColor: `${agentBorderColor}${finalOpacity}`,
          border: `2px solid ${agentBorderColor}45`,
        }}
      >
        {backgroundIcon && (
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: `url(${backgroundIcon})`,
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              filter: isGM ? "brightness(0.7) contrast(1.2)" : undefined,
              height: "100%",
              opacity: finalOpacity / 100,
            }}
          />
        )}
        <div className="flex items-center gap-2 relative z-10">
          <div className="flex-1 min-w-0">
            {/* <TooltipProvider> */}
            {/* <Tooltip> */}
            {/* <TooltipTrigger asChild> */}
            <div
              className={cn(
                "text-md w-full overflow-x-hidden",
                "text-white",
                // Only apply action colors for specific actions
                agentName.toLowerCase() in actionColors &&
                  `text-[${actionColor.text}]`,
                "line-clamp-5 break-words"
              )}
            >
              {renderedMessage}
            </div>
            {/* </TooltipTrigger> */}
            {/* <TooltipContent */}
            {/* side="bottom" */}
            {/* className="max-w-[300px] break-words bg-gray-800 border-gray-700 text-gray-200" */}
            {/* > */}
            {/* {renderedMessage} */}
            {/* </TooltipContent> */}
            {/* </Tooltip> */}
            {/* </TooltipProvider> */}
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
