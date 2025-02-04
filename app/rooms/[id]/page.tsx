"use client";

import Loader from "@/components/loader";
import { useToast } from "@/hooks/use-toast";
import { WSMessageOutput, WsMessageType } from "@/lib/backend.types";
import supabase from "@/lib/config";
import { AgentChat } from "@/stories/AgentChat";
import { BuySellGameAvatarInteraction } from "@/stories/BuySellGameAvatarInteraction";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { PublicChat, PublicChatMessage } from "@/stories/PublicChat";

export default function RoomDetailPage() {
  const params = useParams();
  const id = params.id;
  const roomId = parseInt(id);

  // State for room details (common data)
  const [roomData, setRoomData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  // Separate states for public chat and agent messages
  const [messages, setMessages] = useState<any[]>([]);
  const [agentMessages, setAgentMessages] = useState<any[]>([]);

  // States for round navigation
  const [roundList, setRoundList] = useState<any[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);

  const currentUserId = 1;
  const { toast } = useToast();
  const maxRetries = 5;

  // Normalize message text from different formats.
  // For gm_action messages, extract nested text if available.
  const normalizeMessage = (msg: any) => {
    if (msg.content) {
      if (msg.content.content && typeof msg.content.content.text === "string") {
        return msg.content.content.text;
      }
      if (typeof msg.content.text === "string") {
        return msg.content.text;
      }
    }
    if (msg.message && typeof msg.message === "object" && msg.message.text) {
      return msg.message.text;
    }
    return msg.message || "";
  };

  // --- API FETCHING FUNCTIONS ---

  const fetchRoomDetails = async (roomId: number) => {
    const { data, error } = await supabase
      .from("rooms")
      .select(`*`)
      .eq("id", roomId)
      .single();
    if (error) throw error;
    return data;
  };

  const fetchRoundList = async (roomId: number) => {
    const { data, error } = await supabase
      .from("rounds")
      .select("id, created_at")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  };

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

  const loadRoundData = async (roundId: number) => {
    try {
      const round = await fetchRoundDetails(roundId);

      // Process agents solely from round data
      const roundAgents =
        round?.round_agents?.map((ra: any) => ({
          id: ra.agent_id || ra.agents?.id,
          displayName: ra.display_name || ra.agents?.display_name,
          image: ra.image_url || ra.agents?.image_url,
          color: ra.color || ra.agents?.color,
        })) ?? [];

      // Process agent messages from round_agent_messages.
      const processedAgentMsgs =
        round?.round_agent_messages?.map((msg: any) => ({
          agentId: msg.agent_id,
          message: normalizeMessage(msg),
          createdAt: msg.created_at,
          messageType: msg.message_type,
          agentDetails:
            roundAgents.find((agent: any) => agent.id === msg.agent_id) || null,
          _timestamp: msg.created_at
            ? new Date(msg.created_at).getTime()
            : Date.now(),
          type: msg.message_type || WsMessageType.GM_ACTION,
        })) ?? [];

      // Process public user messages from round_user_messages.
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
      setRoomData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          agents: roundAgents,
          roundNumber: roundList.length,
        };
      });

      setMessages(processedUserMsgs);
      // For agent messages, keep only the latest 50.
      setAgentMessages(
        processedAgentMsgs.length > 50
          ? processedAgentMsgs.slice(processedAgentMsgs.length - 50)
          : processedAgentMsgs
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
        const room = await fetchRoomDetails(roomId);
        setRoomData({
          ...room,
        });

        const roundsData = await fetchRoundList(roomId);
        setRoundList(roundsData);

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
    if (currentRoundIndex < roundList.length - 1) {
      const newIndex = currentRoundIndex + 1;
      setCurrentRoundIndex(newIndex);
      await loadRoundData(roundList[newIndex].id);
    }
  };

  const handleNextRound = async () => {
    if (currentRoundIndex > 0) {
      const newIndex = currentRoundIndex - 1;
      setCurrentRoundIndex(newIndex);
      await loadRoundData(roundList[newIndex].id);
    }
  };

  // --- WebSocket Logic ---
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
        console.log("event data type", data.type);

        if (
          data.type === WsMessageType.PUBLIC_CHAT ||
          data.type === WsMessageType.SYSTEM_NOTIFICATION ||
          data.type === WsMessageType.PARTICIPANTS
        ) {
          // For PUBLIC_CHAT, SYSTEM_NOTIFICATION, or PARTICIPANTS,
          // we create a message object to be handled by the public chat.
          let publicMessage;
          if (data.type === WsMessageType.PARTICIPANTS) {
            publicMessage = {
              type: data.type,
              message: `Participants: ${data.content.count}`,
              _timestamp: Date.now(),
              content: data.content,
            };
          } else {
            publicMessage = {
              type: data.type,
              message: normalizeMessage(data),
              _timestamp: Date.now(),
              content: data.content,
            };
          }
          setMessages((prev) => {
            const updated = [...prev, publicMessage];
            return updated.length > 50
              ? updated.slice(updated.length - 50)
              : updated;
          });
        } else if (
          data.type === WsMessageType.AI_CHAT ||
          data.type === WsMessageType.GM_ACTION ||
          data.type === WsMessageType.PVP_ACTION ||
          data.type === WsMessageType.OBSERVATION
        ) {
          console.log("Agent message received:", data);
          setAgentMessages((prev) => {
            const newMessageId = data.content?.message_id;
            const alreadyExists = newMessageId
              ? prev.some((msg) => msg.content?.message_id === newMessageId)
              : false;
            if (alreadyExists) return prev;
            const newMessage = {
              ...data,
              _timestamp: Date.now(),
              message: normalizeMessage(data),
              messageType: data.type,
            };
            const updated = [...prev, newMessage];
            return updated.length > 50
              ? updated.slice(updated.length - 50)
              : updated;
          });
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

  // Filter for public messages to display.
  const publicMessages = messages.filter(
    (msg) => msg.type === WsMessageType.PUBLIC_CHAT || WsMessageType.SYSTEM_NOTIFICATION || WsMessageType.PARTICIPANTS
  );

  if (loading) return <Loader />;
  if (!roomData)
    return (
      <div className="flex items-center justify-center h-screen">
        <span>Room not found</span>
      </div>
    );

  // Convert public messages to the shape expected by PublicChat.
  const publicChatMessages: PublicChatMessage[] = publicMessages.map((msg) => ({
    address: msg.content?.author || msg.userId || "Unknown",
    avatarUrl: "", // Optionally, add logic to set avatar
    message: msg.message,
    timestamp: new Date(msg._timestamp),
  }));

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
                    roomData.agents.map((agent: any) => (
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
            {/* Agent Chat: shows only agent messages */}
            <div className="flex-1 bg-card rounded-lg overflow-hidden w-full">
              <AgentChat
                className="h-full min-w-full"
                showHeader={false}
                messages={agentMessages}
              />
            </div>
          </div>
          {/* Right Section: Room Details, Round Navigation, and Public Chat */}
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
            {/* Public Chat: shows streaming public messages */}
            <div className="flex flex-col bg-card rounded-lg p-4 overflow-y-auto h-full">
              <PublicChat
                messages={publicChatMessages}
                className="h-full"
                currentUserAddress={String(currentUserId)}
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
