import { useState } from "react";
import { cn } from "@/lib/utils";
import { AgentAvatar } from "./AgentAvatar";
import Image from "next/image";
import bullIcon from "@/stories/assets/bull.svg";
import bearIcon from "@/stories/assets/bear.svg";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"; // Adjust the import path as needed
import { Button } from "@/components/ui/button"; // ShadCN Button component

interface AgentAvatarInteractionProps {
  name: string;
  borderColor: string;
  imageUrl?: string;
  betAmount: number;
  betType?: "Buy" | "Sell";
}

export function AgentAvatarInteraction({
  name,
  borderColor,
  imageUrl,
  betAmount,
  betType,
}: AgentAvatarInteractionProps) {
  const hasBet = betAmount > 0 && betType;

  return (
    <Dialog>
      <div className="group relative">
        <AgentAvatar
          name={name}
          borderColor={borderColor}
          imageUrl={imageUrl}
          variant="sm"
          className={cn(hasBet && "opacity-70")}
        />

        {/* Bet Status Overlay */}
        {/* {hasBet && (
          <div
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center rounded-full",
              betType === "Sell"
                ? "bg-[rgb(var(--bear-red)_/_0.30)]"
                : "bg-[rgb(var(--bull-green)_/_0.30)]"
            )}
          >
            <div
              className="text-sm font-semibold text-center leading-none"
              style={{
                color: `rgb(var(--${
                  betType === "Sell" ? "bear-red" : "bull-green"
                }))`,
              }}
            >
              <div>{betAmount} SOL</div>
              <div className="mt-1">{betType.toUpperCase()}</div>
              <div className="mt-1 flex justify-center">
                <Image
                  src={betType === "Sell" ? bearIcon : bullIcon}
                  alt={betType}
                  className="w-12 h-12"
                />
              </div>
            </div>
          </div>
        )} */}

        <DialogTrigger asChild>
          <div
            className={cn(
              "absolute inset-0 bg-white/85 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
              "flex flex-col items-center justify-center gap-0.5",
              "text-gray-500 text-sm font-semibold cursor-pointer"
            )}
          >
            <span>{betAmount > 0 ? "CHANGE" : "PLACE"}</span>
            <span>BET</span>
          </div>
        </DialogTrigger>
      </div>

      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>
            {betAmount > 0 ? "Modify or Cancel Bet" : "Place a Bet"}
          </DialogTitle>
          <DialogDescription>
            <div className="flex flex-col items-center pt-6 gap-y-4">
              <AgentAvatar
                name={name}
                borderColor={borderColor}
                imageUrl={imageUrl}
                variant="lg"
                className={cn(hasBet && "opacity-70")}
              />
              <div
                className="text-sm font-semibold text-center leading-none"
                style={{
                  color: `rgb(var(--${
                    betType === "Sell" ? "bear-red" : "bull-green"
                  }))`,
                }}
              >
                <div className="text-gray-200">{betAmount} SOL</div>
                <div className="mt-1">{betType?.toUpperCase()}</div>
                <div className="mt-1 flex justify-center">
                  <Image
                    src={betType === "Sell" ? bearIcon : bullIcon}
                    alt={betType}
                    className="w-12 h-12"
                  />
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        {/* Example Form/Buttons for Bet Actions */}
        <div className="space-y-4 my-4">
          {betAmount > 0 ? (
            <>
              <Button
                variant="default"
                className="w-full rounded-none"
                onClick={() => {
                  // Implement logic for modifying the bet here
                }}
              >
                Modify Bet
              </Button>
              <Button
                variant="destructive"
                className="w-full rounded-none"
                onClick={() => {
                  // Implement logic for canceling the bet here
                }}
              >
                Cancel Bet
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              className="w-full rounded-none"
              onClick={() => {
                // Implement logic for placing a bet here
              }}
            >
              Place Bet
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
