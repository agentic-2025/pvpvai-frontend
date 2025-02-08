import React, { useState } from "react";

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
  const total = buy + sell + hold;
  const buyPercentage = total > 0 ? (buy / total) * 100 : 0;
  const sellPercentage = total > 0 ? (sell / total) * 100 : 0;
  const holdPercentage = total > 0 ? (hold / total) * 100 : 0;

  const [hovered, setHovered] = useState<"buy" | "sell" | "hold" | null>(null);

  return (
    <div className="relative w-full h-6 flex rounded-full overflow-hidden border border-gray-700">
      {/* Buy Section */}
      <div
        className="h-full bg-green-500 transition-all relative"
        style={{ width: `${buyPercentage}%` }}
        onMouseEnter={() => setHovered("buy")}
        onMouseLeave={() => setHovered(null)}
      >
        {hovered === "buy" && (
          <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 bg-green-700 text-white text-xs px-2 py-1 rounded-md shadow-lg">
            Buy: {buy} ({buyPercentage.toFixed(1)}%)
          </div>
        )}
      </div>

      {/* Hold Section */}
      <div
        className="h-full bg-gray-500 transition-all relative"
        style={{ width: `${holdPercentage}%` }}
        onMouseEnter={() => setHovered("hold")}
        onMouseLeave={() => setHovered(null)}
      >
        {hovered === "hold" && (
          <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded-md shadow-lg">
            Hold: {hold} ({holdPercentage.toFixed(1)}%)
          </div>
        )}
      </div>

      {/* Sell Section */}
      <div
        className="h-full bg-red-500 transition-all relative"
        style={{ width: `${sellPercentage}%` }}
        onMouseEnter={() => setHovered("sell")}
        onMouseLeave={() => setHovered(null)}
      >
        {hovered === "sell" && (
          <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 bg-red-700 text-white text-xs px-2 py-1 rounded-md shadow-lg">
            Sell: {sell} ({sellPercentage.toFixed(1)}%)
          </div>
        )}
      </div>
    </div>
  );
};
