import { FC } from "react";
import { RatioBar } from "./RatioBar";
import bearIcon from "./assets/bear.svg";
import bullIcon from "./assets/bull.svg";

interface BullBearRatioBarProps {
  bearAmount: number;
  bullAmount: number;
}

/**
 * A convenience wrapper around RatioBar that's prefilled with bear and bull configurations.
 * Displays a ratio bar showing the proportion between bearish and bullish amounts.
 */
export const BullBearRatioBar: FC<BullBearRatioBarProps> = ({
  bearAmount,
  bullAmount,
}) => {
  const items = [
    {
      label: "SELL",
      amount: bearAmount,
      color: "#E9171A",
      iconUrl: bearIcon.src,
    },
    {
      label: "BUY",
      amount: bullAmount,
      color: "#17E97D",
      iconUrl: bullIcon.src,
    },
  ];

  return <RatioBar items={items} noContentLabel="No bets" />;
};
