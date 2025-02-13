/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Loader from "@/components/loader";
import { Skeleton } from "@/components/ui/skeleton";
import { wagmiConfig } from "@/components/wrapper/wrapper";
import { useToast } from "@/hooks/use-toast";
import {
  agentDecisionAiChatOutputSchema,
  agentMessageAiChatOutputSchema,
  AllAiChatMessageSchemaTypes,
  AllOutputSchemaTypes,
  gmMessageAiChatOutputSchema,
  heartbeatOutputMessageSchema,
  observationMessageAiChatOutputSchema,
  publicChatMessageInputSchema,
  pvpActionEnactedAiChatOutputSchema,
  subscribeRoomInputMessageSchema,
  WsMessageTypes,
} from "@/lib/backend.types";
import supabase from "@/lib/config";
import { roomAbi } from "@/lib/contract.types";
import { Tables } from "@/lib/database.types";
import {
  useRoundAgentMessages,
  useRoundUserMessages,
} from "@/lib/queries/messageQueries";
import { AgentAvatar } from "@/stories/AgentAvatar";
import { AgentChat } from "@/stories/AgentChat";
import { BuySellGameAvatarInteraction } from "@/stories/BuySellGameAvatarInteraction";
import { PublicChat } from "@/stories/PublicChat";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { getAddress, PublicClient } from "viem";
import { readContract } from "viem/actions";
import { useAccount, usePublicClient } from "wagmi";
import { z } from "zod";
import { useRoundTransitions, RoundState } from '@/hooks/useRoundTransitions';
import { cn } from "@/lib/utils";
import { useQueryClient } from '@tanstack/react-query';
import { useControlState } from '@/hooks/useControlState';
import { QueryFilters } from '@tanstack/react-query';

// --- Query Hooks ---
const useRoomDetails = (roomId: number) => {
  return useQuery({
    queryKey: ["room", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select(`*`)
        .eq("id", roomId)
        .single();
      if (error) throw error;
      return data;
    },
  });
};

// MODIFIED: Updated query to include underlying_contract_round
const useRoundsByRoom = (roomId: number) => {
  return useQuery({
    queryKey: ["roundsByRoom", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rounds")
        .select("id, created_at, underlying_contract_round") // ADDED: underlying_contract_round
        .eq("room_id", roomId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

const calculateCurrentRoundAndCountdown = (
  createdAt: string,
  roundDuration: number
) => {
  const createdAtTimestamp = Math.floor(new Date(createdAt).getTime() / 1000);
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const elapsedTime = currentTimestamp - createdAtTimestamp;

  // If the room hasn't started yet, return round 0 and the time until start
  if (elapsedTime < 0) {
    return { currentRound: 0, timeLeft: -elapsedTime };
  }

  const currentRound = Math.floor(elapsedTime / roundDuration) + 1;
  const timeLeft = roundDuration - (elapsedTime % roundDuration);

  return { currentRound, timeLeft };
};

type RoundAgentLookup = {
  [agentId: number]: {
    roundAgentData: Tables<"round_agents">;
    agentData: Tables<"agents">;
    walletAddress: string;
  };
};

const useRoundAgents = (roundId: number) => {
  return useQuery({
    queryKey: ["roundAgents", roundId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("round_agents")
        .select(
          `
              *,
              agents(*),
              rounds(rooms(room_agents(agent_id, wallet_address)))
            `
        )
        .eq("round_id", roundId);
      if (error) {
        console.error("Error fetching round agents", error);
        throw error;
      }
      console.log(data, "data");

      // Transform array into lookup object
      return data?.reduce<RoundAgentLookup>((acc, roundAgent) => {
        if (roundAgent.agent_id && roundAgent.rounds.rooms.room_agents) {
          const walletAddress = roundAgent.rounds.rooms.room_agents.find(
            (roomAgent) => roomAgent.agent_id === roundAgent.agent_id
          )?.wallet_address;

          if (!walletAddress) {
            throw "Wallet address not found for agent";
          }

          acc[roundAgent.agent_id] = {
            roundAgentData: roundAgent,
            agentData: roundAgent.agents,
            walletAddress: walletAddress,
          };
        }
        return acc;
      }, {});
    },
    enabled: !!roundId,
  });
};
// moved to useRoundTransitions.ts
// const fetchCurrentRoundId = async (contractAddress: string) => {
//   try {
//     console.log("Fetching current contract round ID");
//     const result = await readContract(wagmiConfig, {
//       abi: roomAbi,
//       address: getAddress(contractAddress),
//       functionName: "currentRoundId",
//     });
//     return result;
//   } catch (error) {
//     console.error("Error fetching current round ID:", error);
//     return null;
//   }
// };

// const getRoundEndTime = async (contractAddress: string, roundId: bigint) => {
//   try {
//     const result = await readContract(wagmiConfig, {
//       abi: roomAbi,
//       address: getAddress(contractAddress),
//       functionName: "getRoundEndTime",
//       args: [BigInt(roundId)],
//     });
//     return Number(result);
//   } catch (error) {
//     console.error("Error fetching round end time:", error);
//     return null;
//   }
// };

const getRoundEndTime = async (contractAddress: string, roundId: bigint, roomData: Tables<"rooms">) => {
  try {
    // Get round start time from contract
    const roundStartTime = await readContract(wagmiConfig, {
      abi: roomAbi,
      address: getAddress(contractAddress),
      functionName: "getRoundStartTime",
      args: [BigInt(roundId)],
    });

    // Get duration from room config
    const roundDuration = getRoundDurationFromConfig(roomData);
    
    // Calculate end time by adding duration to start time
    return Number(roundStartTime) + roundDuration;
  } catch (error) {
    console.error("Error calculating round end time:", error);
    return null;
  }
};

const getRoundDurationFromConfig = (roomData: Tables<"rooms">): number => {
  try {
    const config = roomData.room_config;
    if (config && typeof config === 'object' && 'round_duration' in config) {
      return (config as { round_duration: number }).round_duration;
    }
    return 120; // Default duration in seconds
  } catch (error) {
    console.error('Error parsing room config:', error);
    return 120; // Default duration if parsing fails
  }
};

const fetchCurrentBlockTimestamp = async (publicClient: PublicClient) => {
  try {
    const block = await publicClient.getBlock();
    return Math.floor(Number(block.timestamp)); // Ensure seconds, not milliseconds
  } catch (error) {
    console.error("Error fetching current block timestamp:", error);
    return null;
  }
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

const getAgentPosition = async (
  contractAddress: string,
  roundId: bigint,
  agentAddress: `0x${string}`
) => {
  try {
    const result = await readContract(wagmiConfig, {
      abi: roomAbi,
      address: getAddress(contractAddress),
      functionName: "getAgentPosition",
      args: [BigInt(roundId), agentAddress],
    });
    console.log("Agent Position:", result);
    return result;
  } catch (error) {
    console.error("Error fetching agent position:", error);
    return null;
  }
};

// ADDED: Function to get round state for any round
const getRoundState = async (contractAddress: string, roundId: bigint) => {
  try {
    const state = await readContract(wagmiConfig, {
      abi: roomAbi,
      address: getAddress(contractAddress),
      functionName: "getRoundState",
      args: [roundId],
    });
    return Number(state);
  } catch (error) {
    console.error("Error fetching round state:", error);
    return null;
  }
};

// MODIFIED: Updated to handle bigint conversion properly
// MODIFIED: Updated type to include underlying_contract_round
interface RoundWithContract {
  id: number;
  created_at: string;
  underlying_contract_round: string;
}

function RoundDetailsAndNavigation({
  roomData,
  roundList,
  currentRoundIndex,
  timeLeft,
  isLoadingRoom,
  isLoadingRounds,
  setCurrentRoundIndex,
  roundAgents,
  participants,
  contractRoundId, // ADDED: New prop
  onRoundSelect, // ADDED: Callback to handle round selection
  roundState, // ADDED: New prop for round state
}: {
  roomData: Tables<"rooms">;
  roundList: RoundWithContract[]; // MODIFIED: Updated type
  currentRoundIndex: number;
  timeLeft: string | null;
  isLoadingRoom: boolean;
  isLoadingRounds: boolean;
  setCurrentRoundIndex: (index: number) => void;
  roundAgents: RoundAgentLookup | undefined;
  participants: number;
  contractRoundId: bigint | null; // ADDED: New prop type
  onRoundSelect: (roundId: bigint) => void; // ADDED: New prop type
  roundState: RoundState; // ADDED: Type for round state
}) {
  // MODIFIED: Navigation handlers to use database rounds
  const handlePrevRound = () => {
    if (currentRoundIndex < roundList.length - 1) {
      setCurrentRoundIndex(currentRoundIndex + 1);
    }
  };

  const handleNextRound = () => {
    if (currentRoundIndex > 0) {
      setCurrentRoundIndex(currentRoundIndex - 1);
    }
  };

  // MODIFIED: Get current round number from database
  const currentRound = roundList[currentRoundIndex]?.underlying_contract_round;
  
  // ADDED: Debug logging
  console.log('Round Navigation:', {
    currentIndex: currentRoundIndex,
    totalRounds: roundList.length,
    currentRound,
    roundList: roundList.map(r => r.underlying_contract_round)
  });

  if (isLoadingRoom || isLoadingRounds) {
    return (
      <div className="h-[20%] bg-card rounded-lg p-4 flex flex-col items-center justify-center gap-y-2">
        <Skeleton className="h-10 w-48" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-12 w-32" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  // MODIFIED: Debug logging now shows contract-based numbers
  // console.log('Round Display Debug:', {
  //   contractRound,
  //   maxRound,
  //   currentIndex: currentRoundIndex,
  //   canGoPrev: contractRound > 1,
  //   canGoNext: contractRound < maxRound
  // });

  return (
    <div className="min-h-[20%] overflow-y-auto scroll-thin bg-card p-3">
      <div className="bg-[#202123] rounded-lgpy-2 flex flex-col items-center justify-center gap-y-4">
        {/* MODIFIED: Added container for name + badge */}
        <div className="flex items-center gap-2">
          <h2
            className="text-2xl font-bold truncate text-center"
            style={{ color: roomData.color || "inherit" }}
          >
            {roomData.name}
          </h2>
          
          {/* ADDED: Round state badge */}
          <span className={cn(
            "text-sm px-3 py-1 rounded-full font-medium",
            roundState === RoundState.OPEN ? "bg-green-500/20 text-green-300" :
            roundState === RoundState.CLOSED ? "bg-red-500/20 text-red-300" :
            "bg-gray-500/20 text-gray-300"
          )}>
            {roundState === RoundState.OPEN ? "OPEN" :
             roundState === RoundState.CLOSED ? "CLOSED" :
             "UNKNOWN"}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* MODIFIED: Update round navigation to consider contract round */}
          <button
            onClick={handlePrevRound}
            // FIXED: Disable based on contract round numbers
            disabled={currentRoundIndex >= roundList.length - 1}
            className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            {/* MODIFIED: Only show current round number */}
            Round {currentRound || 'N/A'}
          </span>
          <button
            onClick={handleNextRound}
            // FIXED: Disable based on contract round numbers
            disabled={currentRoundIndex <= 0}
            className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>

        <div className="flex -space-x-2">
          {roundAgents &&
            Object.values(roundAgents).map((agent) => (
              <AgentAvatar
                key={agent.agentData.id}
                id={agent.agentData.id}
                name={agent.agentData.display_name || ""}
                imageUrl={agent.agentData.image_url || ""}
                borderColor={agent.agentData.color || ""}
                variant="sm"
              />
            ))}
        </div>

        <span className="text-lg font-semibold">
          {participants} {participants === 1 ? "person" : "people"} watching
        </span>

        <span className="text-xl font-bold bg-[#E97B17] text-white py-2 px-3 rounded">
          {timeLeft}
        </span>


      </div>
    </div>
  );
}

function isValidMessageType(
  messageType: string
): messageType is WsMessageTypes {
  return Object.values(WsMessageTypes).includes(messageType as WsMessageTypes);
}

// Add this new component above the main component
function AgentsSkeleton() {
  return (
    <div className="flex flex-wrap justify-center items-center gap-10">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-2 w-[200px] h-[250px] bg-card/50 rounded-lg p-4"
        >
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="w-3/4 h-6" />
          <Skeleton className="w-1/2 h-4" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="w-20 h-8" />
            <Skeleton className="w-20 h-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

function AgentsDisplay({
  roundAgents,
  isLoadingAgents,
  roundIdFromContract,
  roomData,
  isRoundOpen,
  selectedRoundId, // ADDED: Include selectedRoundId prop
  currentContractRound, // ADDED: New prop type
  isTransitioning,
}: {
  roundAgents: RoundAgentLookup | undefined;
  isLoadingAgents: boolean;
  roundIdFromContract: bigint | null;
  roomData: Tables<"rooms">;
  isRoundOpen: boolean;
  selectedRoundId: bigint | null; // ADDED: Type for selectedRoundId
  currentContractRound: bigint | null; // ADDED: New prop type
  isTransitioning: boolean;
}) {
  const [agentPositions, setAgentPositions] = useState<{ [key: number]: any }>(
    {}
  );

  // ADDED: PVP status state tracking
  const [agentPvpStatuses, setAgentPvpStatuses] = useState<{ [key: number]: any }>({});

  useEffect(() => {
    const fetchAgentPositions = async () => {
      if (!roundAgents || !roomData || !roundIdFromContract) return;

      console.log("roundIdFromContract", roundIdFromContract);
      const positions: { [key: number]: any } = {};
      for (const agent of Object.values(roundAgents)) {
        try {
          const position = await getAgentPosition(
            roomData.contract_address || "",
            roundIdFromContract,
            agent.walletAddress as `0x${string}`
          );
          positions[agent.agentData.id] = position;
        } catch (error) {
          console.error(
            `Error fetching position for agent ${agent.agentData.id}:`,
            error
          );
        }
      }
      setAgentPositions(positions);
    };

    fetchAgentPositions();

    const interval = setInterval(fetchAgentPositions, 4000);

    return () => clearInterval(interval);
  }, [roundAgents, roundIdFromContract, roomData]);

  useEffect(() => {
    const fetchPvpStatuses = async () => {
      if (!roundAgents || !roomData || !roundIdFromContract) return;
      const statuses: { [key: number]: any } = {};
      for (const agent of Object.values(roundAgents)) {
        try {
          const pvpStatus = await readContract(wagmiConfig, {
            abi: roomAbi,
            address: getAddress(roomData.contract_address || ""),
            functionName: "getPvpStatuses",
            args: [agent.walletAddress as `0x${string}`],
          });
          statuses[agent.agentData.id] = pvpStatus;
        } catch (error) {
          console.error(`Error fetching PVP status for agent ${agent.agentData.id}:`, error);
        }
      }
      setAgentPvpStatuses(statuses);
    };

    fetchPvpStatuses();
    const interval = setInterval(fetchPvpStatuses, 4000);
    return () => clearInterval(interval);
  }, [roundAgents, roundIdFromContract, roomData]);

  // ADDED: Check if this is the current round and is open
  const isActiveRound = Number(selectedRoundId) === Number(currentContractRound) && isRoundOpen;
  
  console.log('Round State Debug:', {
    selectedRound: selectedRoundId?.toString(),
    currentRound: currentContractRound?.toString(),
    isOpen: isRoundOpen,
    isActive: isActiveRound
  });

  // ADDED: Use control state hook
  const isControlsEnabled = useControlState(
    isRoundOpen,
    selectedRoundId,
    currentContractRound
  );

  return (
    <div className={cn(
      "w-full h-[60%] bg-card rounded-lg p-3",
      !isControlsEnabled && "pointer-events-none opacity-70"
    )}>
      {/* Add transition overlay */}
      {isTransitioning && (
        <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader />
            <p className="text-lg text-white">Transitioning to next round...</p>
          </div>
        </div>
      )}
      
      <div className="bg-[#202123] flex flex-col items-center justify-center w-full h-full rounded-md">
        {isLoadingAgents ? (
          <AgentsSkeleton />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="flex flex-col items-center justify-center gap-y-2 w-full pb-4 border-b border-gray-800 mb-4">
              <span className="text-gray-400">Agents are discussing:</span>
              {(() => {
                try {
                  const token = roomData.room_config?.token;
                  if (!token)
                    return <div>No token specified in room config</div>;

                  return (
                    <div className="text-xl font-medium flex items-center gap-x-2">
                      <img
                        src={token.image_url}
                        alt={token.name}
                        className="w-14 h-14 mr-2"
                      />
                      {token.name} (${token.symbol})
                    </div>
                  );
                } catch (error) {
                  console.error("Error parsing room config:", error);
                  return null;
                }
              })()}
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 overflow-y-auto scroll-thin w-full max-h-[80%] p-4">
              {roundAgents && Object.values(roundAgents).length > 0 ? (
                Object.values(roundAgents).map((agent) => (
                  <BuySellGameAvatarInteraction
                    key={agent.agentData.id}
                    roomData={roomData}
                    id={agent.agentData.id}
                    name={agent.agentData.display_name}
                    imageUrl={agent.agentData.image_url || ""}
                    borderColor={agent.agentData.color}
                    sell={agentPositions[agent.agentData.id]?.sell || 0}
                    buy={agentPositions[agent.agentData.id]?.buyPool || 0}
                    hold={agentPositions[agent.agentData.id]?.hold || 0}
                    variant="full"
                    betAmount={agentPositions[agent.agentData.id]?.hold || 0}
                    address={agent.walletAddress}
                    isRoundOpen={isActiveRound} // FIXED: Only enable controls for current round when open
                    // ADDED: Pass agent's PVP statuses
                    pvpStatuses={agentPvpStatuses[agent.agentData.id] || []}
                    isRoundActive={isRoundOpen}
                    roundState={RoundState.OPEN}
                  />
                ))
              ) : (
                <span className="text-gray-400">
                  No agents available in this round
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RoomDetailPage() {
  const params = useParams<{ id: string }>();
  const roomId = parseInt(params.id);
  const currentUserId = 1; // TODO: Do not hardcode me
  const publicClient = usePublicClient();
  const { address: walletAddress } = useAccount();
  // Timer states
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [formattedTime, setFormattedTime] = useState<string>("--:--:--");
  // Separate states for public chat and agent messages
  const [messages, setMessages] = useState<
    z.infer<typeof publicChatMessageInputSchema>[]
  >([]); // TODO: fix type
  const [participants, setParticipants] = useState<number>(0);
  const [aiChatMessages, setAiChatMessages] = useState<
    AllAiChatMessageSchemaTypes[]
  >([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);

  const { toast } = useToast();
  const maxRetries = 5;

  // Query hooks
  const { data: roomData, isLoading: isLoadingRoom } = useRoomDetails(roomId);
  const { data: roundList = [], isLoading: isLoadingRounds } =
    useRoundsByRoom(roomId);

  const currentRoundId = roundList[currentRoundIndex]?.id;

  const { data: roundAgentMessages, isLoading: isLoadingRoundAgentMessages } =
    useRoundAgentMessages(currentRoundId);
  const {
    data: roundPublicChatMessages,
    isLoading: isLoadingPublicChatMessages,
  } = useRoundUserMessages(currentRoundId);
  const { data: roundAgents, isLoading: isLoadingAgents } =
    useRoundAgents(currentRoundId);
  // const { data: gameMaster, isLoading: isLoadingGM } =
  //   useRoundGameMaster(currentRoundId);

  // --- WebSocket Logic ---
  const socketUrl = `${process.env.NEXT_PUBLIC_BACKEND_WS_URL}`;
  const { sendMessage, readyState, getWebSocket } =
    useWebSocket<AllOutputSchemaTypes>(socketUrl, {
      shouldReconnect: () => {
        const ws = getWebSocket();
        const retries = (ws as any)?.retries || 0;
        if (retries >= maxRetries) {
          toast({
            variant: "destructive",
            title: "Connection Error",
            description:
              "Failed to connect after multiple attempts. Please refresh the page.",
            duration: Infinity,
          });
          return false;
        }
        return true;
      },
      reconnectInterval: 5000,
      reconnectAttempts: maxRetries,
      onOpen: () => {
        // console.log("WebSocket connected");
        const ws = getWebSocket();
        (ws as any).retries = 0;
        sendMessage(
          JSON.stringify({
            messageType: WsMessageTypes.SUBSCRIBE_ROOM,
            author: currentUserId,
            timeStamp: Date.now(),
            content: { roomId },
          } as z.infer<typeof subscribeRoomInputMessageSchema>)
        );
        toast({
          title: "Connected",
          description: "Successfully connected to the chat server",
        });
      },
      onMessage: (event) => {
        console.log("Received message:", event.data);
        let data: AllOutputSchemaTypes;
        try {
          data =
            typeof event.data === "string"
              ? JSON.parse(event.data)
              : event.data;
        } catch (err) {
          console.error("Failed to parse websocket message", err);
          return;
        }

        if (!isValidMessageType(data.messageType)) {
          console.error(
            `Invalid message type ${data.messageType} received:`,
            data
          );
          return;
        }

        // Now data.messageType will have proper type inference
        switch (data.messageType) {
          case WsMessageTypes.PUBLIC_CHAT:
            console.log("Public chat message received:", data);
            const parsedData = publicChatMessageInputSchema.safeParse(data);
            console.log("Parsed data public chat:", parsedData);
            setMessages((prev) => [...prev, data]);
            break;

          case WsMessageTypes.GM_MESSAGE:
            console.log("GM message received:", data);
            const parsedGMData = gmMessageAiChatOutputSchema.safeParse(data);
            console.log("Parsed data GM message:", parsedGMData);
            setAiChatMessages((prev) => [...prev, data]);
            break;

          case WsMessageTypes.PVP_ACTION_ENACTED:
            console.log("PVP action enacted message received:", data);
            const parsedPVPData =
              pvpActionEnactedAiChatOutputSchema.safeParse(data);
            console.log(
              "Parsed data PVP action enacted message:",
              parsedPVPData
            );
            setAiChatMessages((prev) => [...prev, data]);
            break;

          case WsMessageTypes.OBSERVATION:
            console.log("Observation message received:", data);
            const parsedObservationData =
              observationMessageAiChatOutputSchema.safeParse(data);
            console.log(
              "Parsed data observation message:",
              parsedObservationData
            );
            setAiChatMessages((prev) => [...prev, data]);
            break;

          case WsMessageTypes.AGENT_MESSAGE:
            console.log("Agent message received:", data);
            const parsedAgentData =
              agentMessageAiChatOutputSchema.safeParse(data);
            console.log("Parsed data agent message:", parsedAgentData);
            setAiChatMessages((prev) => [...prev, data]);
            break;

          case WsMessageTypes.AGENT_DECISION:
            console.log("Agent decision received:", data);
            const parsedAgentDecisionData =
              agentDecisionAiChatOutputSchema.safeParse(data);
            console.log("Parsed data agent decision:", parsedAgentDecisionData);
            setAiChatMessages((prev) => [...prev, data]);
            break;
          case WsMessageTypes.HEARTBEAT:
            sendMessage(
              JSON.stringify({
                messageType: WsMessageTypes.HEARTBEAT,
                content: {},
              } as z.infer<typeof heartbeatOutputMessageSchema>)
            );
            break;

          case WsMessageTypes.SYSTEM_NOTIFICATION:
            if (data.content.error) {
              toast({
                variant: "destructive",
                title: "Encountered an error",
                description: data.content.text,
              });
            }
            break;

          case WsMessageTypes.PARTICIPANTS:
            setParticipants(data.content.count);
            break;

          default:
            console.error(
              `Unhandled message type ${data.messageType} received:`,
              data
            );
            break;
        }
      },
      onClose: () => {
        const ws = getWebSocket();
        (ws as any).retries = ((ws as any).retries || 0) + 1;
        toast({
          variant: "destructive",
          title: "Disconnected",
          description:
            "Lost connection to chat server. Attempting to reconnect...",
        });
      },
      onError: () => {
        console.error("WebSocket error");
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: "Failed to connect to chat server. Retrying...",
        });
      },
    });

  // --- Timer Logic ---
  // Instead of refreshing the timer every 5 seconds only,
  // we use a two‑tier approach:
  // 1. A 1‑second interval that decrements the local timer.
  // 2. A 5‑second interval that re‑fetches the round end time from the blockchain.
  // MODIFIED: Rename hook state to avoid naming conflict
  const {
    currentRoundId: roundIdFromContract,
    roundState: contractRoundState, // Renamed from roundState
    hasTransitioned,
    isRoundActive,
    acknowledgeTransition
  } = useRoundTransitions(roomData?.contract_address || null);

  // MODIFIED: Rename local state to avoid conflict
  const [localRoundState, setLocalRoundState] = useState<number | null>(null); // Renamed from roundState

  // Add effect to handle round transitions
  useEffect(() => {
    if (hasTransitioned) {
      console.log("Round transition detected!", {
        contractState: contractRoundState,
        localState: localRoundState
      });
      
      // Clear messages for the new round
      setMessages([]);
      setAiChatMessages([]);
      
      // Reset local round state
      setLocalRoundState(null);
      
      // Show transition toast
      toast({
        title: "Round Updated",
        description: contractRoundState === RoundState.OPEN ? 
          "New round has started!" : 
          "Current round has ended.",
        duration: 5000,
      });
      
      acknowledgeTransition();
    }
  }, [hasTransitioned, contractRoundState, localRoundState, toast, acknowledgeTransition]);

  // ADDED: New state for tracking round state from contract
  const [roundState, setRoundState] = useState<number | null>(null);

  // MODIFIED: Remove selectedRoundId state since we use roundIdFromContract
  const [selectedRoundId, setSelectedRoundId] = useState<bigint | null>(null);

  useEffect(() => {
    if (!publicClient) {
      console.error("No public client found");
      return;
    }
    const updateTimer = async () => {
      if (!roomData || !roundIdFromContract) return;

      // ADDED: Fetch round state from contract
      try {
        // Get round end time using the modified function
        const roundEndTimeFetched = await getRoundEndTime(
          roomData.contract_address || "",
          roundIdFromContract,
          roomData
        );
        
        if (!roundEndTimeFetched) return;
  
        const currentTimestamp = await fetchCurrentBlockTimestamp(publicClient);
        if (!currentTimestamp) return;
  
        const baseRemainingTime = roundEndTimeFetched - currentTimestamp;
        setTimeLeft(baseRemainingTime > 0 ? baseRemainingTime : 0);
  
        // Debug logging
        console.log({
          roundDuration: getRoundDurationFromConfig(roomData),
          roundEndTime: roundEndTimeFetched,
          currentTime: currentTimestamp,
          remainingTime: baseRemainingTime
        });
      } catch (error) {
        console.error("Error updating timer:", error);
      }
    };
  
    // Initial update
    updateTimer();
  
    // Local countdown
    const countdownInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return prev;
        const newTime = prev - 1;
        return newTime >= 0 ? newTime : 0;
      });
    }, 1000);
  
    // Sync with blockchain every 5 seconds
    const syncInterval = setInterval(updateTimer, 5000);
  
    return () => {
      clearInterval(countdownInterval);
      clearInterval(syncInterval);
    };
  }, [publicClient, roomData, roundIdFromContract]); // Only re-run when currentRoundIndex changes

  useEffect(() => {
    if (timeLeft !== null) {
      setFormattedTime(timeLeft > 0 ? formatTime(timeLeft) : "00:00");
    }
  }, [timeLeft]);

  // MODIFIED: Update round tracking logic with proper type handling
  useEffect(() => {
    if (!roomData || !roundList || !roundIdFromContract) return;

    // ADDED: Log the values for debugging
    console.log('Contract Round Raw:', roundIdFromContract);
    console.log('Contract Round Number:', Number(roundIdFromContract));
    console.log('Available Rounds:', roundList.map(r => ({
      id: r.id,
      underlying: r.underlying_contract_round
    })));

    // Find the round that matches the contract round ID
    const activeRoundIndex = roundList.findIndex((round) => {
      // FIXED: Ensure consistent number conversion for comparison
      const contractRound = Number(roundIdFromContract);
      const underlyingRound = round.underlying_contract_round ? Number(round.underlying_contract_round) : null;
      
      // ADDED: Debug log for round matching
      console.log(`Comparing contract round ${contractRound} with underlying round ${underlyingRound}`);
      
      return underlyingRound === contractRound;
    });

    // Update current round index if found
    if (activeRoundIndex !== -1) {
      console.log(`Matched round index: ${activeRoundIndex}`);
      // ADDED: Set selectedRoundId to matched round's underlying_contract_round
      setCurrentRoundIndex(activeRoundIndex);
      setSelectedRoundId(BigInt(roundList[activeRoundIndex].underlying_contract_round)); // <-- COMMENT: Link selectedRoundId to matched round
    } else {
      console.warn(`No matching round found for contract round: ${Number(roundIdFromContract)}`);
    }
  }, [roundIdFromContract, roundList]);

  // MODIFIED: Effect to fetch round state for current contract round only
  useEffect(() => {
    if (!publicClient || !roomData || !roundIdFromContract) return;

    const updateRoundState = async () => {
      try {
        const state = await getRoundState(roomData.contract_address || "", roundIdFromContract);
        console.log(`Round ${roundIdFromContract.toString()} state:`, state);
        setRoundState(state);
      } catch (error) {
        console.error("Error fetching round state:", error);
      }
    };

    updateRoundState();
  }, [publicClient, roomData, roundIdFromContract]);

  // ADDED: Handler for round selection
  const handleRoundSelect = (roundId: bigint) => {
    console.log("Selected round:", roundId.toString());
    setSelectedRoundId(roundId);
  };

  useEffect(() => {
    if (!roomData || !roomData.room_config || !roundList.length) return;

    // Use the earliest (first) round's created_at as the baseline.
    const baselineRoundCreatedAt = roundList[roundList.length - 1]?.created_at;
    const roundDuration = roomData.room_config.round_duration;
    if (!baselineRoundCreatedAt) return;

    const updateTimer = () => {
      const { timeLeft } = calculateCurrentRoundAndCountdown(
        baselineRoundCreatedAt,
        roundDuration
      );
      setTimeLeft(timeLeft);
    };

    // Update the timer every second based solely on recalculation.
    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [roomData, roundList]);

  useEffect(() => {
    if (timeLeft !== null) {
      setFormattedTime(
        timeLeft > 0
          ? new Date(timeLeft * 1000).toISOString().substr(14, 5)
          : "00:00"
      );
    }
  }, [timeLeft]);

  // ADDED: Query client for cache invalidation
  const queryClient = useQueryClient();
  
  // ADDED: Transition state management
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ADDED: Centralized round transition handler
  const handleRoundTransition = async () => {
    setIsTransitioning(true);
    try {
      // Update selected round to match contract
      setSelectedRoundId(roundIdFromContract);
      
      // Clear message states
      setMessages([]);
      setAiChatMessages([]);
      
      // FIXED: Properly type query invalidation
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['roundAgents']
        }),
        queryClient.invalidateQueries({
          queryKey: ['roundUserMessages']
        }),
        queryClient.invalidateQueries({
          queryKey: ['roundAgentMessages']
        }),
        queryClient.invalidateQueries({
          queryKey: ['roundsByRoom']
        })
      ]);

      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "New Round Started",
        description: "Moving to latest round...",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error during round transition:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update round data. Please refresh.",
      });
    } finally {
      setIsTransitioning(false);
    }
  };

  // ADDED: Watch for round transitions
  useEffect(() => {
    let prevRoundId = roundIdFromContract;

    const checkRoundTransition = async () => {
      if (prevRoundId !== null && 
          roundIdFromContract !== null && 
          prevRoundId !== roundIdFromContract) {
        console.log('[Round Transition]', {
          from: prevRoundId.toString(),
          to: roundIdFromContract.toString()
        });
        await handleRoundTransition();
      }
      prevRoundId = roundIdFromContract;
    };

    checkRoundTransition();
  }, [roundIdFromContract]);

  // MODIFIED: Effect to handle round transitions and selection
  useEffect(() => {
    if (!roomData || !roundList || !roundIdFromContract) return;

    // Debug current state
    console.log('[Round Selection Debug]', {
      currentContract: roundIdFromContract.toString(),
      available: roundList.map(r => r.underlying_contract_round),
      selectedRound: selectedRoundId?.toString()
    });

    // Always select the current contract round
    setSelectedRoundId(roundIdFromContract);

    // Find matching round in our list
    const activeRoundIndex = roundList.findIndex((round) => 
      Number(round.underlying_contract_round) === Number(roundIdFromContract)
    );

    if (activeRoundIndex !== -1) {
      setCurrentRoundIndex(activeRoundIndex);
    } else {
      // If round not found in list, create new round entry
      console.warn('Current round not in list - may need to fetch latest rounds');
    }
  }, [roundIdFromContract, roundList]);

  if (isLoadingRoom)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  if (!roomData)
    return (
      <div className="flex items-center justify-center h-screen">
        <span>Room not found</span>
      </div>
    );
  return (
    <div className="relative">
      {/* ADDED: Transition overlay */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg text-center">
            <Loader />
            <p className="mt-4">Transitioning to new round...</p>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-center w-full">
        <div className="max-w-screen-2xl w-full mx-auto p-4 bg-secondary/50 rounded-xl">
          <div className="w-full flex gap-6 h-[calc(100vh-10rem)]">
            {/* Left Section: Room Info, Agents, and Agent Chat */}
            <div className="w-[65%] flex flex-col gap-6">
              <AgentsDisplay
                roundAgents={roundAgents}
                isLoadingAgents={isLoadingAgents}
                roundIdFromContract={roundIdFromContract}
                roomData={roomData}
                isRoundOpen={contractRoundState === RoundState.OPEN} // Use contract state
                selectedRoundId={selectedRoundId} // ADDED: Pass selected round ID
                currentContractRound={roundIdFromContract} // ADDED: Pass current contract round
                isTransitioning={isTransitioning}
              />
              {/* Agent Chat: shows only agent messages */}
              <div className="flex-1 bg-card rounded-lg overflow-hidden w-full">
                <AgentChat
                  className="h-full min-w-full bg-[#202123] p-3"
                  showHeader={false}
                  messages={[...(roundAgentMessages || []), ...aiChatMessages]}
                  roomId={roomId}
                  loading={isLoadingRoundAgentMessages}
                  roundId={currentRoundId}
                />
              </div>
            </div>
            {/* Right Section: Room Details, Round Navigation, and Public Chat */}
            <div className="w-[35%] flex flex-col gap-6">
              <RoundDetailsAndNavigation
                roomData={roomData}
                roundList={roundList}
                currentRoundIndex={currentRoundIndex}
                timeLeft={formattedTime} // <-- Formatted string (e.g., "04:32")
                isLoadingRoom={isLoadingRoom}
                isLoadingRounds={isLoadingRounds}
                setCurrentRoundIndex={setCurrentRoundIndex}
                roundAgents={roundAgents}
                participants={participants}
                contractRoundId={roundIdFromContract} // ADDED: Pass contract round ID
                onRoundSelect={handleRoundSelect} // ADDED: Pass round selection handler
                roundState={contractRoundState} // ADDED: Pass round state to component
              />
              {/* Public Chat (currently commented out) */}
              <div className="flex flex-col bg-card rounded-lg p-3 overflow-y-auto h-full">
                <PublicChat
                  messages={[...(roundPublicChatMessages || []), ...messages]}
                  className="h-full"
                  currentUserAddress={String(currentUserId)}
                  loading={isLoadingPublicChatMessages}
                  onSendMessage={(message) => {
                    if (readyState === WebSocket.OPEN) {
                      const messagePayload = {
                        messageType: WsMessageTypes.PUBLIC_CHAT,
                        sender: walletAddress,
                        signature: "signature",
                        content: {
                          text: message,
                          userId: currentUserId,
                          roundId: currentRoundId,
                          roomId: roomId,
                          timestamp: Date.now(),
                        },
                      };

                      sendMessage(JSON.stringify(messagePayload));
                      console.log("Message sent:", messagePayload);
                    } else {
                      console.error(
                        "WebSocket is not open. Cannot send message."
                      );
                      toast({
                        variant: "destructive",
                        title: "Error",
                        description:
                          "Unable to send message. WebSocket is not connected.",
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-400 text-center">
            Internal round id: {currentRoundId}, contract round id:{" "}
            {roundIdFromContract}
          </div>
        </div>
      </div>
    </div>
  );
}
