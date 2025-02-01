import { cn } from "@/lib/utils";
import Image from "next/image";
import amnesia from "./assets/pvp/amnesia.svg";
import blind from "./assets/pvp/blind.svg";
import chaos from "./assets/pvp/chaos.svg";
import deafen from "./assets/pvp/deafen.svg";
import deceive from "./assets/pvp/deceive.svg";
import frenzy from "./assets/pvp/frenzy.jpg";
import { default as confuse, default as knife } from "./assets/pvp/knife.svg";
import mindControl from "./assets/pvp/mind-control.svg";
import overload from "./assets/pvp/overload.svg";
import poison from "./assets/pvp/poison.svg";
import silence from "./assets/pvp/silence.svg";

type PvPRuleVariant =
  | "SILENCE"
  | "DEAFEN"
  | "ATTACK"
  | "OVERLOAD"
  | "POISON"
  | "BLIND"
  | "AMNESIA"
  | "DECEIVE"
  | "CONFUSE"
  | "MIND_CONTROL"
  | "FRENZY"
  | "CHAOS";

// Replace the Impact type with an enum
export enum Impact {
  LOW = "low",
  MODERATE = "moderate",
  HIGH = "high",
  OP = "op",
  GAME_BREAKER = "game_breaker",
}

const ruleConfigs = {
  SILENCE: {
    icon: silence.src,
    description: "Prevent an agent from sending messages",
    displayName: "Silence",
    impact: Impact.LOW,
  },
  DEAFEN: {
    icon: deafen.src,
    description: "Prevent an agent from receiving messages from other agents",
    displayName: "Deafen",
    impact: Impact.LOW,
  },
  ATTACK: {
    icon: knife.src,
    description: "Send a direct message to an agent",
    displayName: "Attack",
    impact: Impact.LOW,
  },
  OVERLOAD: {
    icon: overload.src,
    description: "Agent will only receive messages in groups of 5 at a time",
    displayName: "Overload",
    impact: Impact.LOW,
  },
  POISON: {
    icon: poison.src,
    description: "Replace a word in messages sent and received by agent",
    displayName: "Poison",
    impact: Impact.MODERATE,
  },
  BLIND: {
    icon: blind.src,
    description: "Prevent agent from receiving news",
    displayName: "Blind",
    impact: Impact.MODERATE,
  },
  AMNESIA: {
    icon: amnesia.src,
    description: "Delete the last 5 memories of an agent",
    displayName: "Amnesia",
    impact: Impact.MODERATE,
  },
  DECEIVE: {
    icon: deceive.src,
    description: "Temporarily take on a different agent's identity",
    displayName: "Deceive",
    impact: Impact.HIGH,
  },
  CONFUSE: {
    icon: confuse.src,
    description: "Receive news from an unrelated room",
    displayName: "Confuse",
    impact: Impact.HIGH,
  },
  MIND_CONTROL: {
    icon: mindControl.src,
    description: "Replace a word in the agent's cache",
    displayName: "Mind Control",
    impact: Impact.HIGH,
  },
  FRENZY: {
    icon: frenzy.src,
    description: "Dump the public chat into the agent chat",
    displayName: "Frenzy",
    impact: Impact.OP,
  },
  CHAOS: {
    icon: chaos.src,
    description: "Give the game master a personality",
    displayName: "Chaos",
    impact: Impact.GAME_BREAKER,
  },
} as const;

interface PvPRuleCardProps {
  variant: PvPRuleVariant;
  selected?: boolean;
  className?: string;
  onClick?: () => void;
}

export function PvPRuleCard({
  variant,
  selected = false,
  className,
  onClick,
}: PvPRuleCardProps) {
  const config = ruleConfigs[variant];

  const getImpactStyles = (impact: Impact) => {
    switch (impact) {
      case Impact.LOW:
        return selected
          ? "border-primary bg-gray-800 text-gray-100"
          : "border-gray-700 bg-gray-800 hover:border-primary/50 text-gray-100";
      case Impact.MODERATE:
        return selected
          ? "border-yellow-500 bg-yellow-500/10 text-gray-100"
          : "border-yellow-700/50 bg-yellow-900/10 hover:border-yellow-500/50 text-gray-100";
      case Impact.HIGH:
        return selected
          ? "border-red-500 bg-red-500/10 text-gray-100"
          : "border-red-700/50 bg-red-900/10 hover:border-red-500/50 text-gray-100";
      case Impact.OP:
        return selected
          ? "border-purple-500 bg-purple-500/10 text-gray-100"
          : "border-purple-700/50 bg-purple-900/10 hover:border-purple-500/50 text-gray-100";
      case Impact.GAME_BREAKER:
        return selected
          ? "border-white bg-white text-black"
          : "border-white/50 bg-white/90 hover:border-white hover:bg-white text-black";
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center p-2 rounded-lg border-2 transition-all group w-[180px]",
        "hover:scale-105 hover:shadow-lg hover:shadow-primary/20",
        getImpactStyles(config.impact),
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div
        className={cn(
          "relative w-12 h-12 rounded-full p-2 mb-1",
          config.impact === Impact.GAME_BREAKER ? "bg-black/90" : "bg-white/90"
        )}
      >
        <Image
          src={config.icon}
          alt={variant}
          fill
          className={cn(
            "transition-all p-2",
            selected
              ? "brightness-100"
              : "brightness-75 group-hover:brightness-100",
            config.impact === Impact.GAME_BREAKER && "invert"
          )}
        />
      </div>
      <div className="text-center max-w-[160px]">
        <h3 className="font-semibold mb-0.5 text-sm">{config.displayName}</h3>
        <p
          className={cn(
            "text-xs line-clamp-2",
            config.impact === Impact.GAME_BREAKER
              ? "text-black/70"
              : "text-gray-400"
          )}
        >
          {config.description}
        </p>
      </div>
    </div>
  );
}
