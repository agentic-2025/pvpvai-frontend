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
import { Tables } from "@/lib/database.types";
import { blockEndTimeToTimer } from "@/lib/utils";
import * as React from "react";
import { getAddress, parseEther, stringToHex } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { AgentAvatar } from "./AgentAvatar";
import { PvPRuleCard } from "./PvPRuleCard";

function validatePvpInput(
  verb: string,
  input: string,
  poisonFind?: string,
  poisonReplace?: string
): { valid: boolean; message?: string } {
  if (verb.toLowerCase() === "attack") {
    if (input.length === 0) {
      return { valid: false, message: "Please enter a message." };
    } else if (input.length > 128) {
      return {
        valid: false,
        message: "Message must be less than 128 characters.",
      };
    }
  } else if (verb.toLowerCase() === "poison") {
    if (!poisonFind || !poisonReplace) {
      return {
        valid: false,
        message: "Both 'Find' and 'Replace' fields are required.",
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
  roomData,
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
            target: address,
            message: input,
          } as PvpAttackActionType["parameters"];
          break;

        case "poison":
          parameters = {
            target: address,
            duration: 30, // You might want to make this configurable
            find: poisonFind,
            replace: poisonReplace,
            case_sensitive: poisonCaseSensitive,
          } as PvpPoisonStatusType["parameters"];
          break;

        case "silence":
          parameters = {
            target: address,
            duration: 30,
          } as PvpSilenceStatusType["parameters"];
          break;

        case "deafen":
          parameters = {
            target: address,
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
      address: getAddress(roomData.contract_address || ""),
      functionName: "getPvpStatuses",
      args: [agentAddress as `0x${string}`],
    });

    setPvpStatuses(statuses as PvpStatus[]);
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

  const activeEffects = pvpStatuses.filter(
    (status) => status.endTime > nowSeconds
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
      <DialogContent className="max-w-4xl border-2 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-center">
            Launch a PvP Action Against{" "}
            <span className="text-primary">{agentName}</span>
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-col items-center justify-center gap-y-4 py-6">
              <div className="w-full flex items-center justify-between">
                {/* Attack */}
                <div className="space-y-2 text-center">
                  <span className="block">{0.0001} ETH</span>
                  <PvPRuleCard
                    variant="ATTACK"
                    selected={pvpVerb === "attack"}
                    onClick={() => handleActionClick("attack")}
                  />
                </div>

                {/* Silence */}
                <div className="space-y-2 text-center">
                  <span className="block">{0.0002} ETH</span>
                  <PvPRuleCard
                    variant="SILENCE"
                    selected={pvpVerb === "silence"}
                    onClick={() => handleActionClick("silence")}
                    disabled={silence ? true : false}
                  />
                  {silence && (
                    <span className="block">
                      {blockEndTimeToTimer(silence.endTime)}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <AgentAvatar
                  name={agentName}
                  borderColor={borderColor}
                  imageUrl={agentImageUrl}
                  variant="lg"
                />
                {activeEffects.length > 0 && (
                  <div className="text-white p-3 rounded-lg w-full max-w-md">
                    <h3 className="text-md font-bold text-center">
                      Active Effects
                    </h3>
                    <ul className="mt-2 space-y-2">
                      {activeEffects.map((effect, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center bg-gray-700 px-3 py-1 rounded-md"
                        >
                          <span className="capitalize">{effect.verb}</span>
                          <span className="text-sm">
                            {blockEndTimeToTimer(effect.endTime)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="w-full flex items-center justify-between">
                {/* Deafen */}
                <div className="space-y-2 text-center">
                  <span className="block">{0.0002} ETH</span>
                  <PvPRuleCard
                    variant="DEAFEN"
                    selected={pvpVerb === "deafen"}
                    onClick={() => handleActionClick("deafen")}
                    disabled={deafen ? true : false}
                  />
                  {deafen && (
                    <span className="block">
                      {blockEndTimeToTimer(deafen.endTime)}
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
                      {blockEndTimeToTimer(poison.endTime)}
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
                          className="resize-none pr-16 border-gray-400"
                          rows={3}
                        />
                        <div className="absolute bottom-2 right-2 text-sm text-muted-foreground">
                          {attackInputText.length}/128
                        </div>
                      </div>
                    )}

                    {pvpVerb.toLowerCase() === "poison" && (
                      <div className="flex items-end justify-center gap-4 w-1/2 mb-2">
                        <div className="flex-1 flex flex-col">
                          <Label htmlFor="find" className="mb-2">
                            Find
                          </Label>
                          <Input
                            id="find"
                            value={poisonFind}
                            onChange={(e) => {
                              if (e.target.value.length <= 12) {
                                setPoisonFind(e.target.value);
                              }
                            }}
                            placeholder="Find word"
                            className="w-full border-gray-400"
                          />
                          <div className="text-xs text-muted-foreground text-right mt-1">
                            {poisonFind.length}/12
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col">
                          <Label htmlFor="replace" className="mb-2">
                            Replace
                          </Label>
                          <Input
                            id="replace"
                            value={poisonReplace}
                            onChange={(e) => {
                              if (e.target.value.length <= 12) {
                                setPoisonReplace(e.target.value);
                              }
                            }}
                            placeholder="Replace with"
                            className="w-full border-gray-400"
                          />
                          <div className="text-xs text-muted-foreground text-right mt-1">
                            {poisonReplace.length}/12
                          </div>
                        </div>

                        <div className="flex flex-col items-center justify-end h-[84px]">
                          <Label htmlFor="case-sensitive" className="mb-2">
                            Case Sensitive
                          </Label>
                          <Switch
                            id="case-sensitive"
                            checked={poisonCaseSensitive}
                            onCheckedChange={setPoisonCaseSensitive}
                            className="mb-6"
                          />
                        </div>
                      </div>
                    )}

                    {(() => {
                      const { valid, message } = validatePvpInput(
                        pvpVerb,
                        attackInputText,
                        poisonFind,
                        poisonReplace
                      );
                      return !valid ? (
                        <p className="text-red-500 text-sm">{message}</p>
                      ) : null;
                    })()}

                    <Button
                      onClick={() => {
                        if (pvpVerb.toLowerCase() === "attack") {
                          handleInvokePvpAction(pvpVerb, attackInputText);
                        } else if (pvpVerb.toLowerCase() === "poison") {
                          handleInvokePvpAction(
                            pvpVerb,
                            JSON.stringify({
                              find: poisonFind,
                              replace: poisonReplace,
                            })
                          );
                        }
                      }}
                      className="w-fit"
                      disabled={
                        !validatePvpInput(
                          pvpVerb,
                          attackInputText,
                          poisonFind,
                          poisonReplace
                        ).valid
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
