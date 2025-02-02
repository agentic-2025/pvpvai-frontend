"use client";

import Loader from "@/components/loader";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { WSMessageOutput, WsMessageType } from "@/lib/backend.types";
import supabase from "@/lib/config";
import { AgentChat } from "@/stories/AgentChat";
import { BuySellGameAvatarInteraction } from "@/stories/BuySellGameAvatarInteraction";
import { RoomWithRelations } from "@/stories/RoomTable";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

export default function RoomDetailPage() {
  const params = useParams();
  const id = params.id;
  const roomId = parseInt(id);

  // State for room details (common data)
  const [roomData, setRoomData] = useState<RoomWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [agentMessages, setAgentMessages] = useState<any[]>([]);

  // States for round navigation
  const [roundList, setRoundList] = useState<any[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentUserId = 1;
  const { toast } = useToast();
  const maxRetries = 5;

  // Normalize message text from different formats
  const normalizeMessage = (msg: any) => {
    if (msg.content && typeof msg.content.text === "string") {
      return msg.content.text;
    }
    if (msg.message && typeof msg.message === "object" && msg.message.text) {
      return msg.message.text;
    }
    return msg.message || "";
  };

  // Scroll to the bottom when messages update
  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // --- API FETCHING FUNCTIONS ---

  // 1. Fetch room details (without round-specific data)
  const fetchRoomDetails = async (roomId: number) => {
    const { data, error } = await supabase
      .from("rooms")
      .select(
        `
        id,
        name,
        type_id,
        image_url,
        color,
        active,
        chain_family,
        contract_address,
        round_time,
        round_ends_on,
        creator_id,
        game_master_id,
        game_master_action_log,
        pvp_action_log,
        room_config,
        created_at,
        updated_at,
        chain_id,
        participants:user_rooms(count)
      `
      )
      .eq("id", roomId)
      .single();
    if (error) throw error;
    return data;
  };

  // 2. Fetch the list of rounds (ids and created_at) for the room
  const fetchRoundList = async (roomId: number) => {
    const { data, error } = await supabase
      .from("rounds")
      .select("id, created_at")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  };

  // 3. Fetch details for a specific round (by round id)
  const fetchRoundDetails = async (roundId: number) => {
    const { data, error } = await supabase
      .from("rounds")
      .select(
        `
        *,
        round_agent_messages(*),
        round_agents(*),
        round_observations(*),
        round_user_messages(*)
      `
      )
      .eq("id", roundId)
      .single();
    if (error) throw error;
    return data;
  };

  // 4. Load round-specific data and update roomData and messages
  const loadRoundData = async (roundId: number) => {
    try {
      const round = await fetchRoundDetails(roundId);

      // Process agents solely from round data (ignore room.room_agents)
      const roundAgents =
        round?.round_agents?.map((ra: any) => {
          return {
            id: ra.agent_id || ra.agents?.id,
            displayName: ra.display_name || ra.agents?.display_name,
            image: ra.image_url || ra.agents?.image_url,
            color: ra.color || ra.agents?.color,
          };
        }) ?? [];

      // Process agent messages from round_agent_messages
      const processedAgentMsgs =
        round?.round_agent_messages?.map((msg: any) => ({
          agentId: msg.agent_id,
          message: normalizeMessage(msg),
          createdAt: msg.created_at,
          agentDetails:
            roundAgents.find((agent: any) => agent.id === msg.agent_id) || null,
        })) ?? [];

      // Process public user messages from round_user_messages
      const processedUserMsgs =
        round?.round_user_messages?.map((msg: any) => ({
          userId: msg.user_id,
          message: normalizeMessage(msg),
          createdAt: msg.created_at,
          _timestamp: msg.created_at
            ? new Date(msg.created_at).getTime()
            : Date.now(),
          source: "api",
          content: msg.content || {},
          type: WsMessageType.PUBLIC_CHAT,
        })) ?? [];
      processedUserMsgs.sort((a, b) => a._timestamp - b._timestamp);

      // Update roomData with round-specific data.
      // Note: We keep room details (like name, participants) as previously fetched.
      setRoomData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          agents: roundAgents, // Use agents exclusively from this round.
          roundNumber: roundList.length, // Total rounds count
          agentMessages: processedAgentMsgs,
        };
      });

      // Update chat messages state
      setMessages(processedUserMsgs);
      setAgentMessages(
        round?.round_agent_messages?.map((msg: any) => ({
          agentId: msg.agent_id,
          message: normalizeMessage(msg),
          createdAt: msg.created_at,
          _timestamp: msg.created_at
            ? new Date(msg.created_at).getTime()
            : Date.now(),
          content: msg.content || {},
          type: WsMessageType.AGENT_CHAT,
        })) ?? []
      );
    } catch (error) {
      console.error("Error loading round details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load round details.",
      });
    }
  };

  // --- Initial Loading (Room & Round List) ---
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch and set room details
        const room = await fetchRoomDetails(roomId);
        const totalParticipants = room.participants?.[0]?.count ?? 0;
        setRoomData({ ...room, participants: totalParticipants });

        // Fetch and store round list
        const roundsData = await fetchRoundList(roomId);
        setRoundList(roundsData);

        // If there are rounds, load the latest round (index 0)
        if (roundsData.length > 0) {
          setCurrentRoundIndex(0);
          await loadRoundData(roundsData[0].id);
        }
      } catch (error) {
        console.error("Error loading room data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load room data.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [roomId]);

  // --- Round Navigation Handlers ---
  const handlePrevRound = async () => {
    // "Prev" means moving to an older round (i.e. a higher index)
    if (currentRoundIndex < roundList.length - 1) {
      const newIndex = currentRoundIndex + 1;
      setCurrentRoundIndex(newIndex);
      await loadRoundData(roundList[newIndex].id);
    }
  };

  const handleNextRound = async () => {
    // "Next" means moving to a newer round (i.e. a lower index)
    if (currentRoundIndex > 0) {
      const newIndex = currentRoundIndex - 1;
      setCurrentRoundIndex(newIndex);
      await loadRoundData(roundList[newIndex].id);
    }
  };

  // --- WebSocket Logic (Unchanged) ---
  const socketUrl = `${process.env.NEXT_PUBLIC_BACKEND_WS_URL}`;
  const { sendMessage, readyState, getWebSocket } =
    useWebSocket<WSMessageOutput>(socketUrl, {
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
        console.log("WebSocket connected");
        const ws = getWebSocket();
        (ws as any).retries = 0;
        sendMessage(
          JSON.stringify({
            type: WsMessageType.SUBSCRIBE_ROOM,
            author: currentUserId,
            timeStamp: Date.now(),
            content: { roomId },
          })
        );
        toast({
          title: "Connected",
          description: "Successfully connected to the chat server",
        });
      },
      onMessage: (event) => {
        console.log("Received message:", event.data);
        let data;
        try {
          data =
            typeof event.data === "string"
              ? JSON.parse(event.data)
              : event.data;
        } catch (err) {
          console.error("Failed to parse websocket message", err);
          return;
        }

        if (data.type === WsMessageType.PUBLIC_CHAT) {
          setMessages((prev) => {
            const newMessageId = data.content?.message_id;
            const alreadyExists = newMessageId
              ? prev.some((msg) => msg.content?.message_id === newMessageId)
              : false;
            if (alreadyExists) return prev;
            const updated = [
              ...prev,
              {
                ...data,
                _timestamp: Date.now(),
                message: normalizeMessage(data),
              },
            ];
            return updated.length > 50
              ? updated.slice(updated.length - 50)
              : updated;
          });
        }
        if (
          data.type === WsMessageType.GM_ACTION ||
          data.type === WsMessageType.AI_CHAT ||
          data.type === WsMessageType.PVP_ACTION ||
          data.type === WsMessageType.AGENT_CHAT
        ) {
          setAgentMessages((prev) => {
            const newMessageId = data.content?.message_id;
            const alreadyExists = newMessageId
              ? prev.some((msg) => msg.content?.message_id === newMessageId)
              : false;
            if (alreadyExists) return prev;
            return [
              ...prev,
              {
                ...data,
                _timestamp: Date.now(),
                message: normalizeMessage(data),
              },
            ];
          });
        }
        if (data.type === WsMessageType.SYSTEM_NOTIFICATION) {
          if (data.content.error) {
            toast({
              variant: "destructive",
              title: "Encountered an error",
              description: data.content.text,
            });
            setMessages((prev) => {
              const updated = [
                ...prev,
                {
                  ...data,
                  _timestamp: Date.now(),
                  message: normalizeMessage(data),
                },
              ];
              return updated.length > 50
                ? updated.slice(updated.length - 50)
                : updated;
            });
          }
        }
      },
      onClose: () => {
        console.log("WebSocket disconnected");
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

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];
  console.log("WebSocket status:", connectionStatus);

  // Filter for public messages to display
  const publicMessages = messages.filter(
    (msg) => msg.type === WsMessageType.PUBLIC_CHAT
  );

  if (loading) return <Loader />;
  if (!roomData)
    return (
      <div className="flex items-center justify-center h-screen">
        <span>Room not found</span>
      </div>
    );

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="max-w-screen-2xl mx-auto p-4 bg-secondary/50 rounded-xl">
        <div className="flex gap-6 h-[calc(100vh-4rem)]">
          {/* Left Section: Room Info, Agents, and Agent Chat */}
          <div className="w-[65%] flex flex-col gap-6">
            <h1 className="text-4xl font-bold truncate text-center">
              {roomData.name}
            </h1>
            {/* Agents Display (from current round) */}
            <div className="h-[60%] overflow-y-auto bg-[#1c1917] rounded-lg p-3">
              <div className="bg-[#262626] flex items-center justify-center h-full rounded-md">
                <div className="flex flex-wrap justify-center items-center gap-10">
                  {roomData.agents.length > 0 ? (
                    roomData.agents.map((agent) => (
                      <BuySellGameAvatarInteraction
                        key={agent.id}
                        id={agent.id}
                        name={agent.displayName}
                        imageUrl={agent.image || ""}
                        borderColor={agent.color}
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
            {/* Agent Chat */}
            <div className="flex-1 bg-card rounded-lg overflow-hidden w-full">
              <AgentChat
                className="h-full"
                showHeader={false}
                messages={agentMessages}
              />
            </div>
          </div>
          {/* Right Section: Room Details, Round Navigation, and User Chat */}
          <div className="w-[35%] flex flex-col gap-6">
            {/* Room Details and Round Navigation */}
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
            {/* User Messages */}
            <div className="flex flex-col bg-card rounded-lg p-4 overflow-y-auto h-full">
              <div
                className="flex-1 bg-muted rounded-lg p-3 flex flex-col overflow-y-auto"
                ref={scrollContainerRef}
              >
                {publicMessages.length === 0 ? (
                  <span className="text-gray-400">No user messages yet</span>
                ) : (
                  publicMessages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-2"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-400 rounded-full flex justify-center items-center">
                            {msg.content?.author || msg.userId || "U"}
                          </div>
                          <div className="ml-2">
                            <p className="text-white">{msg.message}</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-300">
                          <span>
                            {new Date(msg._timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              <Input
                type="text"
                placeholder="Type a message..."
                className="p-2 bg-gray-800 text-white rounded-lg mt-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
