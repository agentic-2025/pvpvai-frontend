import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";

interface BullBearHoldRatioBarProps {
  buy: number;
  sell: number;
  hold: number;
}

export const BullBearHoldRatioBar: React.FC<BullBearHoldRatioBarProps> = ({
  buy,
  sell,
  hold,
}) => {
  const total = BigInt(buy) + BigInt(sell) + BigInt(hold);
  const buyPercentage =
    total > 0 ? Number((Number(BigInt(buy)) / Number(total)) * 100) : 0;
  const sellPercentage =
    total > 0 ? Number((Number(BigInt(sell)) / Number(total)) * 100) : 0;
  const holdPercentage =
    total > 0 ? Number((Number(BigInt(hold)) / Number(total)) * 100) : 0;

  const betDetails = [
    { label: "Buy", amount: buy, percentage: buyPercentage, color: "#16a34a" },
    {
      label: "Hold",
      amount: hold,
      percentage: holdPercentage,
      color: "#9ca3af",
    },
    {
      label: "Sell",
      amount: sell,
      percentage: sellPercentage,
      color: "#dc2626",
    },
  ];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative w-full h-6 flex rounded-full overflow-hidden border-gray-500 border-2 cursor-pointer text-center">
            {total === BigInt(0) ? (
              <div className="h-full w-full transition-all text-center">
                No bets placed
              </div>
            ) : (
              <>
                {/* Buy Section */}
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${buyPercentage}%` }}
                />

                {/* Hold Section */}
                <div
                  className="h-full bg-gray-500 transition-all"
                  style={{ width: `${holdPercentage}%` }}
                />

                {/* Sell Section */}
                <div
                  className="h-full bg-red-500 transition-all"
                  style={{ width: `${sellPercentage}%` }}
                />
              </>
            )}
          </div>
        </TooltipTrigger>

        <TooltipContent side="bottom" className="bg-gray-800 border-gray-700">
          <p className="font-bold text-white text-center mb-2">Bet Details</p>
          {betDetails.map(
            (item, index) =>
              item.amount > 0 && (
                <div key={index} className="flex items-center gap-2 truncate">
                  <Badge
                    className="truncate max-w-[120px]"
                    style={{
                      backgroundColor: item.color,
                      color: "white",
                    }}
                  >
                    {item.label}
                  </Badge>
                  <span className="text-gray-200 whitespace-nowrap">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              )
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
