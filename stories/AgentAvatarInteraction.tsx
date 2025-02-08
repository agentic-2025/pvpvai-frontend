"use client";

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
import { cn } from "@/lib/utils";
import bearIcon from "@/stories/assets/bear.svg";
import bullIcon from "@/stories/assets/bull.svg";
import Image from "next/image";
import { useState } from "react";
import { getAddress, parseEther } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { AgentAvatar } from "./AgentAvatar";
import { PvpActionDialog } from "./PVPActionDialog";
import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import AnimatedBackground from "@/components/ui/animated-tabs";
import { Tables } from "@/lib/database.types";

interface AgentAvatarInteractionProps {
  name: string;
  borderColor: string;
  imageUrl?: string;
  betAmount: number; // initial/default bet amount in SOL
  betType?: "buy" | "hold" | "sell" | null; // initial bet type if any
  agentAddress: string;
  roomData: Tables<"rooms">;
}

const betTypeMap = {
  buy: 1,
  hold: 2,
  sell: 3,
};

export function AgentAvatarInteraction({
  name,
  borderColor,
  imageUrl,
  betAmount,
  betType,
  agentAddress,
  roomData
}: AgentAvatarInteractionProps) {
  const publicClient = usePublicClient();
  const { writeContract } = useWriteContract();
  // Local state for selected bet type and the bet amount (as a string)
  const [selectedBetType, setSelectedBetType] = useState<
    "buy" | "hold" | "sell" | null
  >(betType || null);
  const [localBetAmount, setLocalBetAmount] = useState<string>(
    betAmount.toString()
  );

  const { address: userAddress } = useAccount();
  const [betAmountError, setBetAmountError] = useState<string | null>(null);

  // Update the local bet amount as the user types
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
      console.log("placing bet", roomData.contract_address, agentAddress, betTypeValue, betAmountNumber);

      const { request } = await publicClient.simulateContract({
        abi: roomAbi,

        address: getAddress(roomData.contract_address || ""), // TODO this needs to be coming down from props, it's in the rooms table.
        functionName: "placeBet",
        args: [
          getAddress(agentAddress),
          betTypeValue,
          parseEther(betAmountNumber.toString()),
        ],
        account: userAddress,
        value: parseEther(betAmountNumber.toString()),
      });

      console.log(
        `Calling placeBet on ${getAddress(agentAddress)} (Room: ${getAddress(
          roomData.contract_address || ""
        )}) with args:`,
        request.args
      );

      const depositTx = writeContract(request);
      console.log("Deposit successful:", depositTx);
      // Optionally, handle depositTx.transactionHash if needed.
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
      <div className="group relative">
        <AgentAvatar
          name={name}
          borderColor={borderColor}
          imageUrl={imageUrl}
          variant="md"
          className={cn(
            "transition-opacity",
            selectedBetType ? "opacity-70" : ""
          )}
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex gap-8">
            {/* Place Bet Dialog Trigger */}
            <Dialog>
              <DialogTrigger asChild>
                <button className="z-20 px-4 py-1 text-gray-200 text-xs font-semibold rounded-full transform -translate-x-8 hover:-translate-x-6 transition-transform">
                  {selectedBetType ? "CHANGE BET" : "PLACE BET"}
                </button>
              </DialogTrigger>
              <DialogContent className="bg-secondary !rounded-lg max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {selectedBetType === "sell"
                      ? "Modify or Cancel Sell Bet"
                      : selectedBetType === "hold"
                      ? "Modify or Cancel Hold Bet"
                      : selectedBetType === "buy"
                      ? "Modify or Cancel Buy Bet"
                      : "Place a Bet"}
                  </DialogTitle>
                  <DialogDescription>
                    <div className="flex flex-col items-center pt-6 gap-y-4">
                      <div className="flex justify-center w-full">
                        {/* Avatar in the middle */}
                        <AgentAvatar
                          name={name}
                          borderColor={borderColor}
                          imageUrl={imageUrl}
                          variant="lg"
                          className="mx-4"
                        />
                      </div>
                      <div className="flex justify-center w-full my-2">
                        <AnimatedBackground
                          className="bg-secondary/50 rounded-md"
                          defaultValue={
                            (selectedBetType as string) || undefined
                          }
                          onValueChange={handlePositionChange}
                        >
                          {["buy", "hold", "sell"].map((type) => (
                            <button
                              key={type}
                              data-id={type}
                              className="px-6 py-1.5 rounded-md text-xl font-medium transition-colors"
                            >
                              {type.toUpperCase()}
                            </button>
                          ))}
                        </AnimatedBackground>
                      </div>

                      {/* Bet Amount Input */}
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

                {/* Bottom Dynamic Button Text triggers the deposit call */}
                <Button
                  onClick={handlePlaceBet}
                  disabled={betAmountError !== null || !selectedBetType}
                  className="mt-4 text-center bg-primary rounded hover:bg-secondary-foreground/20 min-w-24 h-10 w-fit text-white text-lg font-medium mx-auto"
                >
                  Bet ${localBetAmount} ETH on ${selectedBetType}
                </Button>
              </DialogContent>{" "}
            </Dialog>

            {/* Take Action Dialog Trigger */}
            <PvpActionDialog
              roomData={roomData}
              agentName={name}
              agentImageUrl={imageUrl}
              borderColor={borderColor}
              agentAddress={agentAddress}
              trigger={
                <button className="z-20 px-4 py-1  text-gray-200 text-xs font-semibold rounded-full transform translate-x-8 hover:translate-x-6 transition-transform">
                  TAKE ACTION
                </button>
              }
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
}
