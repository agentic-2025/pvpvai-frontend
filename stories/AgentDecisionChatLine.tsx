"use client";

import { useAgentQuery } from "@/lib/queries/agentQueries";
import { cn } from "@/lib/utils";
import { AgentBadge } from "./AgentBadge";

interface AgentDecisionChatLineProps {
  agent_id: number;
  className?: string;
  decision: number;
  creatorAddress?: string;
  popularity?: number;
}

const decisionConfig = {
  1: {
    text: "buy",
    color: "#22C55E", // green-500
    darkColor: "#166534", // green-800
  },
  2: {
    text: "sell",
    color: "#EF4444", // red-500
    darkColor: "#991B1B", // red-800
  },
  3: {
    text: "hold",
    color: "#3B82F6", // blue-500
    darkColor: "#1D4ED8", // blue-700
  },
};

export function AgentDecisionChatLine({
  agent_id,
  className,
  decision,
  creatorAddress,
  popularity,
}: AgentDecisionChatLineProps) {
  const { data: agent } = useAgentQuery(agent_id);

  if (!agent) return null;

  const decisionDetails = decisionConfig[decision as keyof typeof decisionConfig] || {
    text: "unknown",
    color: "#6B7280", // gray-500
    darkColor: "#374151", // gray-700
  };

  return (
    <div className="flex items-stretch gap-2 py-1 px-2">
      <div className="flex flex-col items-end gap-0.5 w-[140px] shrink-0">
        <AgentBadge
          id={agent_id}
          name={agent.display_name}
          color={decisionDetails.color}
          variant="sm"
          avatar={agent.image_url}
          creatorAddress={creatorAddress || "0x0"}
          popularity={popularity}
        />
      </div>
      <div
        className={cn(
          "flex-1 min-w-0 rounded px-3 py-1 relative",
          className
        )}
        style={{
          backgroundColor: `${decisionDetails.color}20`,
          border: `2px solid ${decisionDetails.color}45`,
        }}
      >
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-200">
              {agent.display_name} decided to{" "}
              <span
                style={{ color: decisionDetails.color }}
                className="font-medium"
              >
                {decisionDetails.text}
              </span>{" "}
              ETH
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
