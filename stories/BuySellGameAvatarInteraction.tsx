import Link from "next/link";
import { FC } from "react";
import { AgentAvatarInteraction } from "./AgentAvatarInteraction";
import { BullBearHoldRatioBar } from "./BullBearHoldRatioBar";
import { Tables } from "@/lib/database.types";

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
}) => {

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col items-center gap-2">
        <AgentAvatarInteraction
          roomData={roomData}
          name={name}
          borderColor={borderColor}
          imageUrl={imageUrl}
          betAmount={betAmount}
          betType={betType as "buy" | "hold" | "sell" | null}
          agentAddress={address}
          isRoundOpen={isRoundOpen} // ADDED: Pass round state to child component
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
