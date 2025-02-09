"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserQuery } from "@/lib/queries/userQueries";
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

function ChatLineSkeleton({
  variant = "default",
}: {
  variant?: "default" | "compact";
}) {
  if (variant === "compact") {
    return (
      <div className="group flex px-2 py-0.5 min-h-[24px]">
        <span className="w-[50px] shrink-0 pr-2">
          <Skeleton className="h-4 w-8 ml-auto" />
        </span>
        <div className="shrink-0 w-6 h-6 mx-2">
          <Skeleton className="h-full w-full rounded-full" />
        </div>
        <div className="flex gap-2 items-baseline min-w-0">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 px-4 py-2">
      <div className="shrink-0 w-10 h-10">
        <Skeleton className="h-full w-full rounded-full" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="mt-1">
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
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
  const { data: user, isLoading } = useUserQuery(id);

  // Show skeleton while loading
  if (isLoading) {
    return <ChatLineSkeleton variant={variant} />;
  }

  // Use the fallback address if user data isn't available
  const displayAddress = user?.address || address;
  const displayAvatarUrl = avatarUrl;

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
          {displayAvatarUrl ? (
            <Avatar className="h-full w-full">
              <AvatarImage src={displayAvatarUrl} alt={displayAddress} />
              <AvatarFallback className="bg-gray-700 text-white">
                {displayAddress.slice(2, 4).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Jazzicon
              diameter={24}
              seed={jsNumberForAddress(String(displayAddress))}
            />
          )}
        </div>
        <div className="flex gap-2 items-baseline min-w-0">
          <PlayerAddressChip address={displayAddress} variant="small" />
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
        {displayAvatarUrl ? (
          <Avatar className="h-full w-full">
            <AvatarImage src={displayAvatarUrl} alt={displayAddress} />
            <AvatarFallback className="bg-gray-700 text-white">
              {displayAddress.slice(2, 4).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Jazzicon
            diameter={40}
            seed={jsNumberForAddress(String(displayAddress))}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <PlayerAddressChip address={displayAddress} variant="small" />
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
