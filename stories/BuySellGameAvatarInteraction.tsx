import Link from "next/link";
import { FC } from "react";
import { AgentAvatarInteraction } from "./AgentAvatarInteraction";
import { BullBearHoldRatioBar } from "./BullBearHoldRatioBar";
import { Tables } from "@/lib/database.types";
import { cn } from "@/lib/utils";
// import { RoundState } from '@/hooks/useRoundTransitions';

interface BuySellGameAvatarInteractionProps {
  id: number;
  name: string;
  borderColor: string;
  imageUrl?: string;
  betAmount: number;
  betType?: "Buy" | "Sell" | "Hold";
  sell: number;
  buy: number;
  hold: number;
  variant?: "slim" | "full";
  showName?: boolean;
  address: string;
  roomData: Tables<"rooms">;
  isRoundOpen: boolean; // ADDED: New prop for round state
  // ADDED: PVP statuses from contract
  pvpStatuses: {
    verb: string;
    instigator: string;
    endTime: number;
    parameters: string;
  }[];
  isRoundActive: boolean;
  // roundState: RoundState;
}

export const BuySellGameAvatarInteraction: FC<
  BuySellGameAvatarInteractionProps
> = ({
  id,
  name,
  borderColor,
  imageUrl,
  betAmount,
  betType,
  sell,
  buy,
  hold,
  showName = true,
  address,
  roomData,
  isRoundOpen, // ADDED: Destructure new prop
  pvpStatuses, // from contract
  isRoundActive,
  // roundState,
}) => {
  // Debug render state
  console.log('[Avatar Interaction]', {
    name,
    isRoundActive,
    // roundState,
    timestamp: new Date().toISOString()
  });

  return (
    <div className={cn(
      "flex flex-col gap-1 relative",
      // Visual feedback for inactive rounds
      !isRoundActive && "opacity-50 cursor-not-allowed" 
    )}>


      <div
        className={cn(
          "flex flex-col items-center gap-2",
          !isRoundOpen && "opacity-50" // ADDED: Visual feedback for inactive rounds
        )}
      >
        <AgentAvatarInteraction
          roomData={roomData}
          name={name}
          borderColor={borderColor}
          imageUrl={imageUrl}
          betAmount={betAmount}
          betType={betType as "buy" | "hold" | "sell" | null}
          agentAddress={address}
          isRoundOpen={isRoundOpen} // ADDED: Pass round state to child component
          pvpStatuses={pvpStatuses} // ADDED: pass statuses down
        />
        {showName && (
          <Link
            href={`/agent/${id}`}
            className="text-2xl font-medium truncate max-w-full"
            style={{ color: borderColor }}
          >
            {name}
          </Link>
        )}
      </div>

      <div className="">
        <BullBearHoldRatioBar buy={buy} sell={sell} hold={hold} />
      </div>
    </div>
  );
};
