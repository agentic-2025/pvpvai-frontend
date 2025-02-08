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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  PvpAllAllowedParametersType,
  PvpAttackActionType,
  PvpDeafenStatusType,
  PvpPoisonStatusType,
  PvpSilenceStatusType,
} from "@/lib/backend.types";
import { roomAbi } from "@/lib/contract.types";
import * as React from "react";
import { getAddress, parseEther, stringToHex } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { AgentAvatar } from "./AgentAvatar";
import { PvPRuleCard } from "./PvPRuleCard";
import { Tables } from "@/lib/database.types";

function validatePvpInput(
  verb: string,
  input: string
): { valid: boolean; message?: string } {
  if (verb.toLowerCase() === "attack") {
    const words = input.trim().split(/\s+/).filter(Boolean);
    if (words.length < 4 || words.length > 5) {
      return { valid: false, message: "Please enter between 4 and 5 words." };
    }
  } else if (verb.toLowerCase() === "poison") {
    if (!poisonFind || !poisonReplace) {
      return {
        valid: false,
        message: "Both find and replace fields are required.",
      };
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
  roomData: Tables<"rooms">;
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
};

export function PvpActionDialog({
  trigger,
  agentName,
  agentImageUrl,
  borderColor,
  agentAddress,
  roomData
}: PvpActionDialogProps) {
  const { address: userAddress } = useAccount();
  const { writeContract } = useWriteContract();
  const publicClient = usePublicClient();

  const [pvpVerb, setPvpVerb] = React.useState<string | null>(null);
  const [attackInputText, setAttackInputText] = React.useState<string>("");
  const [pvpStatuses, setPvpStatuses] = React.useState<PvpStatus[]>([]);
  const { toast } = useToast();
  const [poisonFind, setPoisonFind] = React.useState("");
  const [poisonReplace, setPoisonReplace] = React.useState("");
  const [poisonCaseSensitive, setPoisonCaseSensitive] = React.useState(false);

  const handleInvokePvpAction = async (verb: string, input: string) => {
    try {
      if (!publicClient) {
        console.error("Public client not found");
        return;
      }
      const address = agentAddress as `0x${string}`;
      if (!userAddress) throw new Error("User not connected");

      let parameters: PvpAllAllowedParametersType;

      switch (verb.toLowerCase()) {
        case "attack":
          parameters = {
            target: parseInt(address),
            message: input,
          } as PvpAttackActionType["parameters"];
          break;

        case "poison":
          parameters = {
            target: parseInt(address),
            duration: 30, // You might want to make this configurable
            find: poisonFind,
            replace: poisonReplace,
            case_sensitive: poisonCaseSensitive,
          } as PvpPoisonStatusType["parameters"];
          break;

        case "silence":
          parameters = {
            target: parseInt(address),
            duration: 30,
          } as PvpSilenceStatusType["parameters"];
          break;

        case "deafen":
          parameters = {
            target: parseInt(address),
            duration: 30,
          } as PvpDeafenStatusType["parameters"];
          break;

        default:
          throw new Error(`Unsupported PvP action encountered: ${verb}`);
      }

      console.log("Invoking PvP action with the following parameters:", {
        verb,
        address,
        parameters,
      });

      const { request } = await publicClient.simulateContract({
        abi: roomAbi,
        address: getAddress(roomData.contract_address || ""),
        functionName: "invokePvpAction",
        args: [address, verb, stringToHex(JSON.stringify(parameters))],
        account: userAddress,
        value: pvpActionFee[verb as keyof typeof pvpActionFee],
      });

      const tx = writeContract(request);
      console.log(`PVP action "${verb}" invoked:`, tx);

      // Reset all state after success
      setPvpVerb(null);
      setAttackInputText("");
      setPoisonFind("");
      setPoisonReplace("");
      setPoisonCaseSensitive(false);
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
    if (!publicClient) {
      console.error("Public client not found");
      return;
    }

    const statuses = await publicClient.readContract({
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

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const nowSeconds = Math.floor(Date.now() / 1000);
  const silence = pvpStatuses.find(
    (status) => status.verb === "silence" && status.endTime > nowSeconds
  );
  const poison = pvpStatuses.find(
    (status) => status.verb === "poison" && status.endTime > nowSeconds
  );
  const deafen = pvpStatuses.find(
    (status) => status.verb === "deafen" && status.endTime > nowSeconds
  );

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
          <DialogDescription asChild>
            <div className="flex flex-col items-center justify-center gap-y-4 py-6">
              <div className="w-full flex items-center justify-between">
                {/* Attack */}
                <div className="space-y-2 text-center">
                  <span className="block">{0.001} ETH</span>
                  <PvPRuleCard
                    variant="ATTACK"
                    selected={pvpVerb === "attack"}
                    onClick={() => handleActionClick("attack")}
                  />
                </div>

                {/* Silence */}
                <div className="space-y-2 text-center">
                  <span className="block">{0.001} ETH</span>
                  <PvPRuleCard
                    variant="SILENCE"
                    selected={pvpVerb === "silence"}
                    onClick={() => handleActionClick("silence")}
                    disabled={silence ? true : false}
                  />
                  {silence && (
                    <span className="block">
                      {displayTimer(silence.endTime)}
                    </span>
                  )}
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
                  <span className="block">{0.001} ETH</span>
                  <PvPRuleCard
                    variant="DEAFEN"
                    selected={pvpVerb === "deafen"}
                    onClick={() => handleActionClick("deafen")}
                    disabled={deafen ? true : false}
                  />
                  {deafen && (
                    <span className="block">
                      {displayTimer(deafen.endTime)}
                    </span>
                  )}
                </div>

                {/* Poison */}
                <div className="space-y-2 text-center">
                  <span className="block">{0.001} ETH</span>
                  <PvPRuleCard
                    variant="POISON"
                    selected={pvpVerb === "poison"}
                    onClick={() => handleActionClick("poison")}
                    disabled={poison ? true : false}
                  />
                  {poison && (
                    <span className="block">
                      {displayTimer(poison.endTime)}
                    </span>
                  )}
                </div>
              </div>

              {pvpVerb &&
                (pvpVerb.toLowerCase() === "attack" ||
                  pvpVerb.toLowerCase() === "poison") && (
                  <div className="w-full flex flex-col items-center mt-4">
                    {pvpVerb.toLowerCase() === "attack" && (
                      <div className="relative w-1/2 mb-2">
                        <Textarea
                          value={attackInputText}
                          onChange={(e) => {
                            if (e.target.value.length <= 128) {
                              setAttackInputText(e.target.value);
                            }
                          }}
                          placeholder="Enter 4 to 5 words..."
                          className="resize-none pr-16"
                          rows={3}
                        />
                        <div className="absolute bottom-2 right-2 text-sm text-muted-foreground">
                          {attackInputText.length}/128
                        </div>
                      </div>
                    )}

                    {pvpVerb.toLowerCase() === "poison" && (
                      <div className="flex items-center gap-4 w-1/2 mb-2">
                        <div className="flex-1">
                          <Label htmlFor="find">Find</Label>
                          <Input
                            id="find"
                            value={poisonFind}
                            onChange={(e) => {
                              if (e.target.value.length <= 12) {
                                setPoisonFind(e.target.value);
                              }
                            }}
                            placeholder="Find word"
                            className="w-full"
                          />
                          <div className="text-xs text-muted-foreground text-right">
                            {poisonFind.length}/12
                          </div>
                        </div>

                        <div className="flex-1">
                          <Label htmlFor="replace">Replace</Label>
                          <Input
                            id="replace"
                            value={poisonReplace}
                            onChange={(e) => {
                              if (e.target.value.length <= 12) {
                                setPoisonReplace(e.target.value);
                              }
                            }}
                            placeholder="Replace with"
                            className="w-full"
                          />
                          <div className="text-xs text-muted-foreground text-right">
                            {poisonReplace.length}/12
                          </div>
                        </div>

                        <div className="flex flex-col items-center justify-end h-full">
                          <Label htmlFor="case-sensitive" className="mb-2">
                            Case Sensitive
                          </Label>
                          <Switch
                            id="case-sensitive"
                            checked={poisonCaseSensitive}
                            onCheckedChange={setPoisonCaseSensitive}
                          />
                        </div>
                      </div>
                    )}

                    {(() => {
                      const { valid, message } = validatePvpInput(
                        pvpVerb,
                        attackInputText
                      );
                      return !valid ? (
                        <p className="text-red-500 text-sm">{message}</p>
                      ) : null;
                    })()}
                    <Button
                      onClick={() =>
                        handleInvokePvpAction(pvpVerb, attackInputText)
                      }
                      className="w-fit"
                      disabled={
                        !validatePvpInput(pvpVerb, attackInputText).valid
                      }
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
