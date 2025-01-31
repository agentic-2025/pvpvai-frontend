import { FC } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface RatioItem {
  label: string;
  amount: number;
  color: string;
  iconUrl?: string;
}

interface RatioBarProps {
  items: RatioItem[];
  noContentLabel?: string;
  className?: string;
}

export const RatioBar: FC<RatioBarProps> = ({
  items,
  noContentLabel = "?",
  className = "",
}) => {
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const hasItems = items.length > 0;
  const hasValue = total > 0;

  const getPercentage = (amount: number) => {
    if (!hasValue) return 0;
    return (amount / total) * 100;
  };

  const formatPercentage = (amount: number) => {
    return `${getPercentage(amount).toFixed(1)}%`;
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`h-3 w-full rounded-full overflow-hidden relative ${className}`}
            style={{
              backgroundColor:
                !hasItems || !hasValue ? "rgb(75 85 99)" : "transparent",
              minWidth: "100px",
            }}
          >
            {!hasItems || !hasValue ? (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                {noContentLabel}
              </div>
            ) : (
              <div className="flex h-full w-full">
                {items.map((item, index) => {
                  const percentage = getPercentage(item.amount);
                  return percentage > 0 ? (
                    <div
                      key={index}
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: item.color,
                      }}
                      className="h-full transition-all duration-300"
                    />
                  ) : null;
                })}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-gray-800 border-gray-700">
          {!hasItems ? (
            <div className="text-sm text-gray-200">No values</div>
          ) : (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2 truncate">
                  {item.iconUrl && (
                    <div className="flex-shrink-0">
                      <Image
                        src={item.iconUrl}
                        alt={`${item.label} icon`}
                        width={16}
                        height={16}
                        className="w-4 h-4"
                      />
                    </div>
                  )}
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
                    {formatPercentage(item.amount)} (
                    {item.amount.toLocaleString()})
                  </span>
                </div>
              ))}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
