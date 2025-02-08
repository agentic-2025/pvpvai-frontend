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
import { wagmiConfig, walletClient } from "@/components/wrapper/wrapper";
import { parseEther, stringToBytes, stringToHex } from "viem";
import { useToast } from "@/hooks/use-toast";
import * as React from "react";
import { useAccount } from "wagmi";
import { AgentAvatar } from "./AgentAvatar";
import { PvPRuleCard } from "./PvPRuleCard";
import { roomAbi } from "@/lib/contract.types";

function validatePvpInput(
  verb: string,
  input: string
): { valid: boolean; message?: string } {
  const words = input.trim().split(/\s+/).filter(Boolean);
  if (verb.toLowerCase() === "attack") {
    if (words.length < 4 || words.length > 5) {
      return { valid: false, message: "Please enter between 4 and 5 words." };
    }
  } else if (verb.toLowerCase() === "poison") {
    if (words.length !== 1) {
      return { valid: false, message: "Please enter exactly 1 word." };
    }
  }
  return { valid: true };
}

interface PvpActionDialogProps {
  trigger: React.ReactNode;
  agentName: string;
  agentImageUrl?: string;
  borderColor: string;
  agentAddress: string;
}

interface PvpStatus {
  endTime: number;
  instigator: string;
  parameters: string;
  verb: string;
}

const pvpActionFee = {
  attack: parseEther("0.0001"),
  poison: parseEther("0.001"),
  silence: parseEther("0.0002"),
  deafen: parseEther("0.0002"),
}

export function PvpActionDialog({
  trigger,
  agentName,
  agentImageUrl,
  borderColor,
  agentAddress,
}: PvpActionDialogProps) {
  const { address: userAddress } = useAccount();

  const [pvpVerb, setPvpVerb] = React.useState<string | null>(null);
  const [pvpInputText, setPvpInputText] = React.useState<string>("");
  const [pvpStatuses, setPvpStatuses] = React.useState<PvpStatus[]>([]);
  const { toast } = useToast();

  const handleInvokePvpAction = async (verb: string, input: string) => {
    try {
      const address = agentAddress as `0x${string}`;
      console.log(stringToBytes(input));
      if (!userAddress) throw new Error("User not connected");

      const { request } = await wagmiConfig.simulateContract({
        abi: roomAbi,
        address: process.env.NEXT_PUBLIC_ROOM_ADDRESS as `0x${string}`,
        functionName: "invokePvpAction",
        args: [address, verb, stringToHex(input)],
        account: userAddress,
        value: pvpActionFee[verb as keyof typeof pvpActionFee],
      });
      const tx = await  walletClient.writeContract(request);
      console.log(`PVP action "${verb}" invoked:`, tx);

      // Reset state after success.
      setPvpVerb(null);
      setPvpInputText("");
    } catch (error) {
      console.error("Error invoking PvP action:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error invoking PvP action: ${error}`,
      });
    }
  };

  const handleActionClick = (verb: string) => {
    if (verb.toLowerCase() === "attack" || verb.toLowerCase() === "poison") {
      setPvpVerb(verb);
    } else {
      handleInvokePvpAction(verb, "");
    }
  };

  const fetchPvpStatuses = async () => {
    const statuses = await wagmiConfig.readContract({
      abi: roomAbi,
      address: process.env.NEXT_PUBLIC_ROOM_ADDRESS as `0x${string}`,
      functionName: "getPvpStatuses",
      args: [agentAddress as `0x${string}`],
    });

    setPvpStatuses(statuses as PvpStatus[]);
  };

  const displayTimer = (endTime: number) => {
    const now = Math.floor(Date.now() / 1000); // Convert JS timestamp to seconds
    const remainingSeconds = endTime - now;

    if (remainingSeconds <= 0) return "0:00";

    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const nowSeconds = Math.floor(Date.now() / 1000);
  const silence = pvpStatuses.find(status => status.verb === "silence" && status.endTime > nowSeconds);
  const poison = pvpStatuses.find(status => status.verb === "poison" && status.endTime > nowSeconds);
  const deafen = pvpStatuses.find(status => status.verb === "deafen" && status.endTime > nowSeconds);

  // refresh each second
  React.useEffect(() => {
    const interval = setInterval(() => {
      fetchPvpStatuses();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-center">
            Launch a PvP Action Against Agent
          </DialogTitle>
          <DialogDescription>
            <div className="flex flex-col items-center justify-center gap-y-4 py-6">
              <div className="w-full flex items-center justify-between">
                {/* Attack */}
                <div className="space-y-2 text-center">
                  <p>{0.001} ETH</p>
                  <PvPRuleCard
                    variant="ATTACK"
                    selected={pvpVerb === "attack"}
                    onClick={() => handleActionClick("attack")}
                  />
                  {/* each pvpStatuses has a endtime, display a timer here that updates every second */}
                  {/* <p>Timer: {pvpStatuses.endtime}</p> */}
                </div>

                {/* Silence */}
                <div className="space-y-2 text-center">
                  <p>{0.001} ETH</p>
                  <PvPRuleCard
                    variant="SILENCE"
                    selected={pvpVerb === "silence"}
                    onClick={() => handleActionClick("silence")}
                    disabled={silence ? true : false}
                  />
                  {silence && displayTimer(silence.endTime)}
                </div>
              </div>

              <div>
                <AgentAvatar
                  name={agentName}
                  borderColor={borderColor}
                  imageUrl={agentImageUrl}
                  variant="lg"
                />
              </div>

              <div className="w-full flex items-center justify-between">
                {/* Deafen */}
                <div className="space-y-2 text-center">
                  <p>{0.001} ETH</p>
                  <PvPRuleCard
                    variant="DEAFEN"
                    selected={pvpVerb === "deafen"}
                    onClick={() => handleActionClick("deafen")}
                    disabled={deafen ? true : false}
                  />
                  {deafen && displayTimer(deafen.endTime)}
                </div>

                {/* Poison */}
                <div className="space-y-2 text-center">
                  <p>{0.001} ETH</p>
                  <PvPRuleCard
                    variant="POISON"
                    selected={pvpVerb === "poison"}
                    onClick={() => handleActionClick("poison")}
                    disabled={poison ? true : false}
                  />
                  {poison && displayTimer(poison.endTime)}
                </div>
              </div>

              {pvpVerb &&
                (pvpVerb.toLowerCase() === "attack" ||
                  pvpVerb.toLowerCase() === "poison") && (
                  <div className="w-full flex flex-col items-center mt-4">
                    <Input
                      type="text"
                      value={pvpInputText}
                      onChange={(e) => setPvpInputText(e.target.value)}
                      placeholder={
                        pvpVerb.toLowerCase() === "attack"
                          ? "Enter 4 to 5 words..."
                          : "Enter 1 word..."
                      }
                      className="w-1/2 mb-2"
                    />
                    {(() => {
                      const { valid, message } = validatePvpInput(
                        pvpVerb,
                        pvpInputText
                      );
                      return !valid ? (
                        <p className="text-red-500 text-sm">{message}</p>
                      ) : null;
                    })()}
                    <Button
                      onClick={() =>
                        handleInvokePvpAction(pvpVerb, pvpInputText)
                      }
                      className="w-fit"
                      disabled={!validatePvpInput(pvpVerb, pvpInputText).valid}
                    >
                      Confirm {pvpVerb}
                    </Button>
                  </div>
                )}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
