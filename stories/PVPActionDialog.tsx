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
import { parseEther } from "viem";
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
  const { toast } = useToast();

  const handleInvokePvpAction = async (verb: string, input: string) => {
    // const parametersHex = Buffer.from(input).toString("hex");
    try {
      const address = agentAddress as `0x${string}`;
      if (!userAddress) throw new Error("User not connected");
      const { request } = await wagmiConfig.simulateContract({
        abi: roomAbi,
        address: process.env.NEXT_PUBLIC_ROOM_ADDRESS as `0x${string}`,
        functionName: "invokePvpAction",
        args: [address, verb, input],
        account: userAddress,
        value: parseEther("0.0002") as bigint,
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

  // const useEffect(() => {
  //   const fetchPvpStatuses = async () => {
  //     if (!publicClient) return;
  //     const statuses = await publicClient.readContract({
  //       abi: roomAbi,
  //       address: roomAddress,
  //       functionName: "getPvpStatuses",
  //       args: [agentAddress],
  //     });
  //     setCurrentPvpStatuses(statuses);
  //   };
  //   fetchPvpStatuses();
  // }, []);

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
                </div>

                {/* Silence */}
                <div className="space-y-2 text-center">
                  <p>{0.001} ETH</p>
                  <PvPRuleCard
                    variant="SILENCE"
                    selected={pvpVerb === "silence"}
                    onClick={() => handleActionClick("silence")}
                  />
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
                  />
                </div>

                {/* Poison */}
                <div className="space-y-2 text-center">
                  <p>{0.001} ETH</p>
                  <PvPRuleCard
                    variant="POISON"
                    selected={pvpVerb === "poison"}
                    onClick={() => handleActionClick("poison")}
                  />
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
