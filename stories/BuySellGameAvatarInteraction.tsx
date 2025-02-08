import { cn } from "@/lib/utils";
import bearIcon from "@/stories/assets/bear.svg";
import bullIcon from "@/stories/assets/bull.svg";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";
import { AgentAvatarInteraction } from "./AgentAvatarInteraction";
import { BullBearRatioBar } from "./BullBearRatioBar";
import { Tables } from "@/lib/database.types";

interface BuySellGameAvatarInteractionProps {
  id: number;
  name: string;
  borderColor: string;
  imageUrl?: string;
  betAmount: number;
  betType?: "Buy" | "Sell";
  bearAmount: number;
  bullAmount: number;
  variant?: "slim" | "full";
  showName?: boolean;
  address: string;
  roomData: Tables<"rooms">;
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
  bearAmount,
  bullAmount,
  variant = "full",
  showName = true,
  address,
  roomData
}) => {
  const total = bearAmount + bullAmount;
  const bearPercentage = total > 0 ? (bearAmount / total) * 100 : 0;
  const bullPercentage = total > 0 ? (bullAmount / total) * 100 : 0;

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
          bearAmount={bearAmount}
          bullAmount={bullAmount}
          agentAddress={address}
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
      <div className="flex items-center gap-2">
        {variant === "full" && (
          <div className="flex flex-col items-center justify-center w-12">
            <Image src={bearIcon} alt="Bear" className="w-6 h-6" />
            <div
              className={cn(
                "text-sm font-medium",
                total > 0 ? "text-[rgb(var(--bear-red))]" : "text-white"
              )}
            >
              {bearPercentage.toFixed(1)}%
            </div>
          </div>
        )}
        <div className="flex-1">
          <BullBearRatioBar bearAmount={bearAmount} bullAmount={bullAmount} />
        </div>
        {variant === "full" && (
          <div className="flex flex-col items-center justify-center w-12">
            <Image src={bullIcon} alt="Bull" className="w-6 h-6" />
            <div
              className={cn(
                "text-sm font-medium",
                total > 0 ? "text-[rgb(var(--bull-green))]" : "text-white"
              )}
            >
              {bullPercentage.toFixed(1)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
