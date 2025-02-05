"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserQuery } from "@/lib/queries/userQueries";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { PlayerAddressChip } from "./PlayerAddressChip";
export interface PublicChatLineProps {
  id: number;
  address: string;
  avatarUrl?: string;
  message: string;
  timestamp: Date;
  className?: string;
  variant?: "default" | "compact";
  showAvatar?: boolean; // <-- Added showAvatar prop
}

export function PublicChatLine({
  id,
  address,
  avatarUrl,
  message,
  timestamp,
  className,
  variant = "default",
}: PublicChatLineProps) {
  const isCompact = variant === "compact";

  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = getUserQuery(id);

  if (isCompact) {
    return (
      <div
        className={cn(
          "group flex hover:bg-gray-800/50 px-2 py-0.5 min-h-[24px]",
          className
        )}
      >
        <span className="text-xs text-gray-400/40 group-hover:text-gray-400 w-[50px] shrink-0 text-right pr-2">
          {format(timestamp, "HH:mm")}
        </span>
        <div className={cn("shrink-0 w-6 h-6 mx-2")}>
          {user?.avatar_url ? (
            <Avatar className="h-full w-full">
              <AvatarImage
                src={user?.avatar_url}
                alt={user?.eth_wallet_address || address}
              />
              <AvatarFallback className="bg-gray-700 text-white">
                {(user?.eth_wallet_address || address)
                  .slice(2, 4)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Jazzicon
              diameter={24}
              seed={jsNumberForAddress(
                String(user?.eth_wallet_address || address)
              )}
            />
          )}
        </div>
        <div className="flex gap-2 items-baseline min-w-0">
          <PlayerAddressChip
            address={user?.eth_wallet_address || address}
            variant="small"
          />
          <div className="text-gray-100 text-sm break-words whitespace-pre-wrap min-w-0">
            {message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-4 hover:bg-gray-800/50 px-4 py-2", className)}>
      <div className={cn("shrink-0 w-10 h-10")}>
        {avatarUrl ? (
          <Avatar className="h-full w-full">
            <AvatarImage
              src={user?.avatar_url}
              alt={user?.eth_wallet_address || address}
            />
            <AvatarFallback className="bg-gray-700 text-white">
              {(user?.eth_wallet_address || address).slice(2, 4).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Jazzicon
            diameter={40}
            seed={jsNumberForAddress(
              String(user?.eth_wallet_address || address)
            )}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <PlayerAddressChip
            address={user?.eth_wallet_address || address}
            variant="small"
          />
          <span className="text-xs text-gray-400">
            {format(timestamp, "HH:mm")}
          </span>
        </div>
        <div className="text-gray-100 break-words whitespace-pre-wrap">
          {message}
        </div>
      </div>
    </div>
  );
}
