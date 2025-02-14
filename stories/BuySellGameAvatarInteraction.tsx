import { Tables } from "@/lib/database.types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { FC } from "react";
import { AgentAvatarInteraction } from "./AgentAvatarInteraction";
import { BullBearHoldRatioBar } from "./BullBearHoldRatioBar";
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
  // ADDED: PVP statuses from contract
  pvpStatuses: {
    verb: string;
    instigator: string;
    endTime: number;
    parameters: string;
  }[];
  isRoundTimerExpired: boolean;
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
  pvpStatuses, // from contract
  isRoundTimerExpired,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 relative",
        // Visual feedback for inactive rounds
        isRoundTimerExpired && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className={cn("flex flex-col items-center gap-2")}>
        <AgentAvatarInteraction
          roomData={roomData}
          name={name}
          borderColor={borderColor}
          imageUrl={imageUrl}
          betAmount={betAmount}
          betType={betType as "buy" | "hold" | "sell" | null}
          agentAddress={address}
          isRoundTimerExpired={isRoundTimerExpired} // ADDED: Pass round state to child component
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
