"use client";

import Loader from "@/components/loader";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Tables } from "@/lib/database.types";
import { useRoundAgentMessages } from "@/lib/queries/messageQueries";
import { AgentChat } from "@/stories/AgentChat";
import { BuySellGameAvatarInteraction } from "@/stories/BuySellGameAvatarInteraction";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import useWebSocket from "react-use-websocket";
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
          agents (*)
        `
        )
        .eq("round_id", roundId);
      if (error) {
        console.error("Error fetching round agents", error);
        throw error;
      }

      // Transform array into lookup object
      return data?.reduce<RoundAgentLookup>((acc, roundAgent) => {
        if (roundAgent.agent_id && roundAgent.agents) {
          acc[roundAgent.agent_id] = {
            roundAgentData: roundAgent,
            agentData: roundAgent.agents,
          };
        }
        return acc;
      }, {});
    },
    enabled: !!roundId,
  });
};

// const useRoundGameMaster = (roundId: number) => {
//   return useQuery({
//     queryKey: ["roundGameMaster", roundId],
//     queryFn: async () => {
//       const { data: round, error: roundError } = await supabase
//         .from("rounds")
//         .select("game_master_id")
//         .eq("id", roundId)
//         .single();
//       if (roundError) throw roundError;

//       if (!round?.game_master_id) return null;

//       const { data: gm, error: gmError } = await supabase
//         .from("agents")
//         .select(`*`)
//         .eq("id", round.game_master_id)
//         .single();
//       if (gmError) {
//         console.error("Error fetching game master", gmError);
//         throw gmError;
//       }

//       return gm;
//     },
//     enabled: !!roundId,
//   });
// };

function RoundDetailsAndNavigation({
  roomData,
  roundList,
  currentRoundIndex,
  timeLeft,
  isLoadingRoom,
  isLoadingRounds,
  setCurrentRoundIndex,
}: {
  roomData: Tables<"rooms">;
  roundList: { id: number; created_at: string }[];
  currentRoundIndex: number;
  timeLeft: string | null;
  isLoadingRoom: boolean;
  isLoadingRounds: boolean;
  setCurrentRoundIndex: (index: number) => void;
}) {
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
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-12 w-32" />
        <Skeleton className="h-6 w-40" />
      </div>
    );
  }

  return (
    <div className="h-[20%] bg-card rounded-lg p-4 flex flex-col items-center justify-center gap-y-2">
      <div className="flex items-center gap-4">
        <button
          onClick={handlePrevRound}
          disabled={currentRoundIndex >= roundList.length - 1}
          className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Round {currentRoundIndex + 1} / {roundList.length}
        </span>
        <button
          onClick={handleNextRound}
          disabled={currentRoundIndex <= 0}
          className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <span>Room ID: {roomData.id}</span>
      <span className="text-3xl font-bold bg-[#E97B17] text-white py-3 px-4">
        {timeLeft}
      </span>
      <span className="text-lg font-semibold">
        {roomData.participants} Participants
      </span>
    </div>
  );
}

function isValidMessageType(
  messageType: string
): messageType is WsMessageTypes {
  return Object.values(WsMessageTypes).includes(messageType as WsMessageTypes);
}
export default function RoomDetailPage() {
  const params = useParams<{ id: string }>();
  const roomId = parseInt(params.id);
  const currentUserId = 1; //TODO Do not hardcode me

  // State for room details (common data)
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  // Separate states for public chat and agent messages
  const [messages, setMessages] = useState<
    z.infer<typeof publicChatMessageInputSchema>[]
  >([]); //TODO fix type
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
  // const {
  //   data: roundPublicChatMessages,
  //   isLoading: isLoadingPublicChatMessages,
  // } = useRoundUserMessages(currentRoundId);
  const { data: roundAgents, isLoading: isLoadingAgents } =
    useRoundAgents(currentRoundId);
  // const { data: gameMaster, isLoading: isLoadingGM } =
  //   useRoundGameMaster(currentRoundId);

  // // Loading state
  // const roomQueriesLoading =
  //   isLoadingRoom ||
  //   isLoadingRounds ||
  //   isLoadingRoundAgentMessages ||
  //   // isLoadingRoundUserMessages ||
  //   isLoadingAgents ||
  //   isLoadingGM;

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
        // console.log("WebSocket disconnected");
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

  // const connectionStatus = {
  //   [ReadyState.CONNECTING]: "Connecting",
  //   [ReadyState.OPEN]: "Open",
  //   [ReadyState.CLOSING]: "Closing",
  //   [ReadyState.CLOSED]: "Closed",
  //   [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  // }[readyState];
  // console.log("WebSocket status:", connectionStatus);

  if (isLoadingRoom) return <Loader />;
  if (!roomData)
    return (
      <div className="flex items-center justify-center h-screen">
        <span>Room not found</span>
      </div>
    );
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="max-w-screen-2xl w-full mx-auto p-4 bg-secondary/50 rounded-xl">
        <div className="w-full flex gap-6 h-[calc(100vh-4rem)]">
          {/* Left Section: Room Info, Agents, and Agent Chat */}
          <div className="w-[65%] flex flex-col gap-6">
            <h1 className="text-4xl font-bold truncate text-center">
              {roomData.name}
            </h1>
            {/* Agents Display (from current round) */}
            <div className="w-full h-[60%] overflow-y-auto bg-[#1c1917] rounded-lg p-3">
              <div className="bg-[#262626] flex items-center justify-center h-full rounded-md">
                <div className="flex flex-wrap justify-center items-center gap-10">
                  {roundAgents && Object.values(roundAgents).length > 0 ? (
                    Object.values(roundAgents).map((agent) => (
                      <BuySellGameAvatarInteraction
                        key={agent.agentData.id}
                        id={agent.agentData.id}
                        name={agent.agentData.display_name}
                        imageUrl={agent.agentData.image_url || ""}
                        borderColor={agent.agentData.color}
                        bearAmount={60}
                        bullAmount={40}
                        variant="full"
                        betAmount={0}
                      />
                    ))
                  ) : (
                    <span className="text-gray-400">
                      No agents available in this round
                    </span>
                  )}
                </div>
              </div>
            </div>
            {/* Agent Chat: shows only agent messages */}
            <div className="flex-1 bg-card rounded-lg overflow-hidden w-full">
              <AgentChat
                className="h-full min-w-full"
                showHeader={false}
                messages={[...(roundAgentMessages || []), ...aiChatMessages]}
                loading={isLoadingRoundAgentMessages}
              />
            </div>
          </div>
          {/* Right Section: Room Details, Round Navigation, and Public Chat */}
          <div className="w-[35%] flex flex-col gap-6">
            <RoundDetailsAndNavigation
              roomData={roomData}
              // participants={participants}
              roundList={roundList}
              currentRoundIndex={currentRoundIndex}
              timeLeft={timeLeft}
              isLoadingRoom={isLoadingRoom}
              isLoadingRounds={isLoadingRounds}
              setCurrentRoundIndex={setCurrentRoundIndex}
            />
            {/* Public Chat: shows streaming public messages */}
            <div className="flex flex-col bg-card rounded-lg p-4 overflow-y-auto h-full">
              {/* <PublicChat
                messages={[...(roundPublicChatMessages || []), ...messages]}
                className="h-full"
                currentUserAddress={String(currentUserId)}
                loading={isLoadingPublicChatMessages}
                onSendMessage={(message) => {
                  // Optionally: implement sending message logic here.
                  console.log("User sending message:", message);
                }}
              /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
