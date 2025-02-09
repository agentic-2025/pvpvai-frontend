"use client";

import Loader from "@/components/loader";
import { Skeleton } from "@/components/ui/skeleton";
import { wagmiConfig } from "@/components/wrapper/wrapper";
import { useToast } from "@/hooks/use-toast";
import {
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
import { usePublicClient } from "wagmi";
import { z } from "zod";

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

const useRoundsByRoom = (roomId: number) => {
  return useQuery({
    queryKey: ["roundsByRoom", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rounds")
        .select("id, created_at")
        .eq("room_id", roomId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
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

const fetchCurrentRoundId = async (contractAddress: string) => {
  try {
    console.log("Fetching current contract round ID");
    const result = await readContract(wagmiConfig, {
      abi: roomAbi,
      address: getAddress(contractAddress),
      functionName: "currentRoundId",
    });
    return result;
  } catch (error) {
    console.error("Error fetching current round ID:", error);
    return null;
  }
};

const getRoundEndTime = async (contractAddress: string, roundId: bigint) => {
  try {
    const result = await readContract(wagmiConfig, {
      abi: roomAbi,
      address: getAddress(contractAddress),
      functionName: "getRoundEndTime",
      args: [BigInt(roundId)],
    });
    return Number(result);
  } catch (error) {
    console.error("Error fetching round end time:", error);
    return null;
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
}: {
  roomData: Tables<"rooms">;
  roundList: { id: number; created_at: string }[];
  currentRoundIndex: number;
  timeLeft: string | null;
  isLoadingRoom: boolean;
  isLoadingRounds: boolean;
  setCurrentRoundIndex: (index: number) => void;
  roundAgents: RoundAgentLookup | undefined;
  participants: number;
}) {
  // Update handlers to match display order
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

  const displayRoundNumber = roundList.length - currentRoundIndex;

  return (
    <div className="min-h-[20%] overflow-y-auto scroll-thin">
      <div className="bg-card rounded-lg p-4 flex flex-col items-center justify-center gap-y-4">
        <h2
          className="text-2xl font-bold truncate text-center"
          style={{ color: roomData.color || "inherit" }}
        >
          {roomData.name}
        </h2>

        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevRound}
            disabled={currentRoundIndex >= roundList.length - 1}
            className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Round {displayRoundNumber} / {roundList.length}
          </span>
          <button
            onClick={handleNextRound}
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
}: {
  roundAgents: RoundAgentLookup | undefined;
  isLoadingAgents: boolean;
  roundIdFromContract: bigint | null;
  roomData: Tables<"rooms">;
}) {
  const [agentPositions, setAgentPositions] = useState<{ [key: number]: any }>(
    {}
  );

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

  return (
    <div className="w-full h-[60%] bg-[#1c1917] rounded-lg p-3">
      <div className="bg-[#262626] flex items-center justify-center w-full h-full rounded-md">
        {isLoadingAgents ? (
          <AgentsSkeleton />
        ) : (
          <div className="flex flex-wrap justify-center items-center gap-24 overflow-y-auto scroll-thin w-full max-h-full">
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
                />
              ))
            ) : (
              <span className="text-gray-400">
                No agents available in this round
              </span>
            )}
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

  // Timer states
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
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
  const [roundIdFromContract, setRoundIdFromContract] = useState<bigint | null>(
    null
  );

  useEffect(() => {
    if (!roomData) return;

    const fetchRoundIdFromContract = async () => {
      const roundIdFromContract = await fetchCurrentRoundId(
        roomData.contract_address || ""
      );

      console.log("roundIdFromContract", roundIdFromContract);
      setRoundIdFromContract(roundIdFromContract);
    };
    fetchRoundIdFromContract();
  }, [currentRoundId, roomData]);

  useEffect(() => {
    if (!publicClient) {
      console.error("No public client found");
      return;
    }
    const updateTimer = async () => {
      if (!roomData || !roundIdFromContract) return;
      const roundEndTimeFetched = await getRoundEndTime(
        roomData.contract_address || "",
        roundIdFromContract
      );
      if (!roundEndTimeFetched) return;
      console.log("Round End Time:", roundEndTimeFetched);

      const currentTimestamp = await fetchCurrentBlockTimestamp(publicClient);
      if (!currentTimestamp) return;

      console.log("Contract Round ID:", roundIdFromContract);
      console.log("Round End Time:", roundEndTimeFetched);
      console.log("Current Timestamp:", currentTimestamp);
      console.log("Date.now()", Date.now());

      const baseRemainingTime = roundEndTimeFetched - currentTimestamp;
      setTimeLeft(baseRemainingTime > 0 ? baseRemainingTime : 0);
    };

    // Initial fetch
    updateTimer();

    // Countdown: decrement the timer every second
    const countdownInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return prev;
        const newTime = prev - 1;
        return newTime >= 0 ? newTime : 0;
      });
    }, 1000);

    // Refresh the timer data every 5 seconds to adjust for drift
    const refreshInterval = setInterval(updateTimer, 5000);

    return () => {
      clearInterval(countdownInterval);
      clearInterval(refreshInterval);
    };
  }, [currentRoundIndex, publicClient, roomData, roundIdFromContract]); // Only re-run when currentRoundIndex changes

  useEffect(() => {
    if (timeLeft !== null) {
      setFormattedTime(timeLeft > 0 ? formatTime(timeLeft) : "00:00");
    }
  }, [timeLeft]);

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
            />
            {/* Agent Chat: shows only agent messages */}
            <div className="flex-1 bg-card rounded-lg overflow-hidden w-full">
              <AgentChat
                className="h-full min-w-full"
                showHeader={false}
                messages={[...(roundAgentMessages || []), ...aiChatMessages]}
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
              timeLeft={timeLeft?.toLocaleString() || "00:00"} // <-- Formatted string (e.g., "04:32")
              isLoadingRoom={isLoadingRoom}
              isLoadingRounds={isLoadingRounds}
              setCurrentRoundIndex={setCurrentRoundIndex}
              roundAgents={roundAgents}
              participants={participants}
            />
            {/* Public Chat (currently commented out) */}
            <div className="flex flex-col bg-card rounded-lg p-4 overflow-y-auto h-full">
              <PublicChat
                messages={[...(roundPublicChatMessages || []), ...messages]}
                className="h-full"
                currentUserAddress={String(currentUserId)}
                loading={isLoadingPublicChatMessages}
                onSendMessage={(message) => {
                  // Optionally: implement sending message logic here.
                  console.log("User sending message:", message);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
