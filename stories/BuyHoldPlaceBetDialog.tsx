"use client";

import AnimatedBackground from "@/components/ui/animated-tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { roomAbi } from "@/lib/contract.types";
import { Tables } from "@/lib/database.types";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { getAddress, parseEther } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { AgentAvatar } from "./AgentAvatar";

interface BuyHoldPlaceBetDialogProps {
  name: string;
  borderColor: string;
  imageUrl?: string;
  betAmount: number;
  betType?: "buy" | "hold" | "sell" | null;
  agentAddress: string;
  roomData: Tables<"rooms">;
  trigger: React.ReactNode;
}

const betTypeMap = {
  buy: 1,
  hold: 2,
  sell: 3,
};

export function BuyHoldPlaceBetDialog({
  name,
  borderColor,
  imageUrl,
  betAmount,
  betType,
  agentAddress,
  roomData,
  trigger,
}: BuyHoldPlaceBetDialogProps) {
  const publicClient = usePublicClient();
  const { writeContract } = useWriteContract();
  const [selectedBetType, setSelectedBetType] = useState<
    "buy" | "hold" | "sell" | null
  >(betType || null);
  const [localBetAmount, setLocalBetAmount] = useState<string>(
    betAmount.toString()
  );
  const { address: userAddress } = useAccount();
  const [betAmountError, setBetAmountError] = useState<string | null>(null);

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (parseFloat(e.target.value) < 0) {
      setBetAmountError("Bet amount must be greater than 0");
      return;
    }
    setLocalBetAmount(e.target.value);
    setBetAmountError(null);
  };

  const handlePlaceBet = async () => {
    if (!publicClient) {
      console.error("Public client not found, is the user's wallet connected?");
      return;
    }
    if (!userAddress || !selectedBetType) {
      console.error(
        "User address or bet type not found, is the user connected and have they selected a bet type?"
      );
      return;
    }

    const betAmountNumber = parseFloat(localBetAmount);
    if (isNaN(betAmountNumber) || betAmountNumber <= 0) {
      console.error("Invalid bet amount, please enter a valid bet amount.");
      return;
    }

    try {
      const betTypeValue = betTypeMap[selectedBetType];
      const { request } = await publicClient.simulateContract({
        abi: roomAbi,
        address: getAddress(roomData.contract_address || ""),
        functionName: "placeBet",
        args: [
          getAddress(agentAddress),
          betTypeValue,
          parseEther(betAmountNumber.toString()),
        ],
        account: userAddress,
        value: parseEther(betAmountNumber.toString()),
      });

      const depositTx = writeContract(request);
      console.log("Deposit successful:", depositTx);
    } catch (error) {
      console.error("Error placing bet:", error);
    }
  };

  const handlePositionChange = (value: string | null) => {
    if (value) {
      setSelectedBetType(value as "buy" | "hold" | "sell");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-secondary !rounded-lg max-w-md">
        <DialogHeader>
          <DialogTitle>
            <div className="text-center ">
              {selectedBetType === "sell"
                ? "Modify or Cancel Sell Bet"
                : selectedBetType === "hold"
                ? "Modify or Cancel Hold Bet"
                : selectedBetType === "buy"
                ? "Modify or Cancel Buy Bet"
                : "Place a Bet"}
              {` on`}{" "}
              <span
                className="border-primary border-b"
                style={{ color: borderColor }}
              >
                {name}
              </span>
            </div>
          </DialogTitle>
          <DialogDescription>
            <div className="flex flex-col items-center pt-6 gap-y-4">
              <div className="flex justify-center w-full">
                <AgentAvatar
                  name={name}
                  borderColor={borderColor}
                  imageUrl={imageUrl}
                  variant="lg"
                  className="mx-4"
                />
              </div>
              <div className="flex justify-center w-full my-2 gap-x-2">
                <AnimatedBackground
                  className="bg-secondary/50 rounded-md"
                  defaultValue={(selectedBetType as string) || undefined}
                  onValueChange={handlePositionChange}
                >
                  {["buy", "hold", "sell"].map((type) => (
                    <button
                      key={type}
                      data-id={type}
                      className={cn(
                        "px-6 py-1.5 rounded-md text-xl font-medium transition-colors",
                        selectedBetType === type
                          ? "bg-primary text-white"
                          : "hover:bg-secondary-foreground/10"
                      )}
                    >
                      {type.toUpperCase()}
                    </button>
                  ))}
                </AnimatedBackground>
              </div>

              <div className="flex flex-col items-center justify-center gap-x-4 w-full">
                <div className="flex items-center justify-center gap-x-2 w-full">
                  <Input
                    type="number"
                    step="0.01"
                    value={localBetAmount}
                    onChange={handleBetAmountChange}
                    placeholder="Enter bet amount"
                    className="w-1/2 mb-2 border-primary/50 rounded"
                  />
                  <span className="text-lg font-medium text-primary/70">
                    ETH
                  </span>
                </div>

                <div className="space-x-6">
                  {[1, 0.1, 0.01, 0.001, 0.0001].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => {
                        setLocalBetAmount(amount.toString());
                        setBetAmountError(null);
                      }}
                      className="text-xs text-gray-400"
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>
              {betAmountError && (
                <p className="text-red-500 text-sm">{betAmountError}</p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <Button
          onClick={handlePlaceBet}
          disabled={betAmountError !== null || !selectedBetType}
          className="mt-4 text-center bg-primary rounded hover:bg-secondary-foreground/20 min-w-24 h-10 w-fit text-white text-lg font-medium mx-auto"
        >
          Bet {localBetAmount} ETH on {selectedBetType?.toUpperCase() || "???"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
