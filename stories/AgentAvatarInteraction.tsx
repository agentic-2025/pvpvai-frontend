"use client";

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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccount } from "wagmi";

// Import your room contract details (adjust the import path as needed)
import { roomAbi, roomAddress } from "@/constants/contact_abi/room-abi";
// Import wagmi and wallet client configuration
import { wagmiConfig, walletClient } from "@/components/wrapper/wrapper";

interface AgentAvatarInteractionProps {
  name: string;
  borderColor: string;
  imageUrl?: string;
  betAmount: number; // initial/default bet amount in SOL
  betType?: "Buy" | "Sell"; // initial bet type if any
  bearAmount: number; // percentage for Sell side
  bullAmount: number; // percentage for Buy side
}

export function AgentAvatarInteraction({
  name,
  borderColor,
  imageUrl,
  betAmount,
  betType,
  bearAmount,
  bullAmount,
}: AgentAvatarInteractionProps) {
  // Local state for selected bet type and the bet amount (as a string)
  const [selectedBetType, setSelectedBetType] = useState<"Buy" | "Sell" | null>(
    betType || null
  );
  const [localBetAmount, setLocalBetAmount] = useState<string>(
    betAmount.toString()
  );

  const { address: userAddress } = useAccount();

  // Update the local bet amount as the user types
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalBetAmount(e.target.value);
  };

  const handlePlaceBet = async () => {
    if (!userAddress || !selectedBetType) {
      alert("Please connect your wallet and select a bet type.");
      return;
    }

    const betAmountNumber = parseFloat(localBetAmount);
    if (isNaN(betAmountNumber) || betAmountNumber <= 0) {
      alert("Please enter a valid bet amount.");
      return;
    }

    try {
      const betTypeValue = selectedBetType === "Buy" ? 1 : 3;
      const { request } = await wagmiConfig.simulateContract({
        abi: roomAbi,
        address: roomAddress,
        functionName: "placeBet",
        args: [userAddress, betTypeValue, BigInt(betAmountNumber)],
        account: userAddress,
      });

      const depositTx = await walletClient.writeContract(request);
      console.log("Deposit successful:", depositTx);
      // Optionally, handle depositTx.transactionHash if needed.
    } catch (error) {
      console.error("Error placing bet:", error);
    }
  };

  return (
    <Dialog>
      <div className="group relative">
        <AgentAvatar
          name={name}
          borderColor={borderColor}
          imageUrl={imageUrl}
          variant="sm"
          className={cn(
            "transition-opacity",
            selectedBetType ? "opacity-70" : ""
          )}
        />

        <DialogTrigger asChild>
          <div
            className={cn(
              "absolute inset-0 bg-white/85 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
              "flex flex-col items-center justify-center gap-0.5",
              "text-gray-500 text-sm font-semibold cursor-pointer"
            )}
          >
            <span>{selectedBetType ? "CHANGE" : "PLACE"}</span>
            <span>BET</span>
          </div>
        </DialogTrigger>
      </div>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {selectedBetType === "Sell"
              ? "Modify or Cancel Sell Bet"
              : selectedBetType === "Buy"
              ? "Modify or Cancel Buy Bet"
              : "Place a Bet"}
          </DialogTitle>
          <DialogDescription>
            <div className="flex flex-col items-center pt-6 gap-y-4">
              <div className="flex items-center justify-between w-full h-60">
                {/* Sell Side */}
                <div className="space-y-2 text-center">
                  <Image
                    src={bearIcon}
                    alt="Sell"
                    width={64}
                    height={64}
                    className="w-16 h-16"
                  />
                  <h5 className="text-red-600 text-3xl font-bold">
                    {bearAmount}%
                  </h5>
                  <button
                    onClick={() => setSelectedBetType("Sell")}
                    className={cn(
                      "px-6 h-8 text-lg font-medium rounded",
                      selectedBetType === "Sell"
                        ? "bg-red-600 text-white"
                        : "border border-red-500 text-red-600"
                    )}
                  >
                    SELL
                  </button>
                </div>

                {/* Avatar in the middle */}
                <AgentAvatar
                  name={name}
                  borderColor={borderColor}
                  imageUrl={imageUrl}
                  variant="lg"
                  className="mx-4"
                />

                {/* Buy Side */}
                <div className="space-y-2 text-center">
                  <Image
                    src={bullIcon}
                    alt="Buy"
                    width={64}
                    height={64}
                    className="w-16 h-16"
                  />
                  <h5 className="text-primary text-3xl font-bold">
                    {bullAmount}%
                  </h5>
                  <button
                    onClick={() => setSelectedBetType("Buy")}
                    className={cn(
                      "px-6 h-8 text-lg font-medium rounded",
                      selectedBetType === "Buy"
                        ? "bg-primary text-white"
                        : "border border-primary text-primary"
                    )}
                  >
                    BUY
                  </button>
                </div>
              </div>

              {/* Bet Amount Input */}
              <div className="flex items-center justify-center gap-x-4 w-full">
                <Input
                  type="number"
                  value={localBetAmount}
                  onChange={handleBetAmountChange}
                  placeholder="Enter bet amount"
                  className="w-1/2 mb-2"
                />
                <span className="text-lg font-medium">SOL</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        {/* Bottom Dynamic Button Text triggers the deposit call */}
        <Button
          onClick={handlePlaceBet}
          className="mt-4 text-center bg-secondary-foreground/40 hover:bg-secondary-foreground/20 min-w-24 h-10 w-fit text-white text-lg font-medium mx-auto"
        >
          Bet ${localBetAmount} SOL on ${selectedBetType}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
