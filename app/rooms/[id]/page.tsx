"use client";

import Loader from "@/components/loader";
import { Input } from "@/components/ui/input";
import supabase from "@/lib/config";
import { AgentChat } from "@/stories/AgentChat";
import { BuySellGameAvatarInteraction } from "@/stories/BuySellGameAvatarInteraction";
import { RoomWithRelations } from "@/stories/RoomTable";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function RoomDetailPage() {
  const params = useParams();
  const id = params.id;
  const [roomData, setRoomData] = useState<RoomWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  // Single state to store all messages (API + socket)
  const [messages, setMessages] = useState<any[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Refs for WebSocket management and cleanup
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Dummy current user id (replace with your auth logic)
  const currentUserId = 1;

  /**
   * normalizeMessage:
   *   - If msg.content.text exists, return that.
   *   - Otherwise, fallback to msg.message.text or msg.message.
   */
  const normalizeMessage = (msg: any) => {
    if (msg.content && typeof msg.content.text === "string") {
      return msg.content.text;
    }
    if (msg.message && typeof msg.message === "object" && msg.message.text) {
      return msg.message.text;
    }
    return msg.message || "";
  };

  // ensuring that the newest messages are visible at the bottom.
  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    const loadRoomDetails = async () => {
      try {
        const { data: roomData, error } = await supabase
          .from("rooms")
          .select(
            `
            id, name, type_id, image_url, color, active, chain_family, contract_address, round_time, round_ends_on, creator_id,
            game_master_id, game_master_action_log, pvp_action_log, room_config, created_at, updated_at, chain_id,
            participants:user_rooms(count),
            room_agents(
              id,
              agents(
                id,
                display_name,
                image_url,
                color
              )
            ),
            users:user_rooms(count),
            rounds(
              id,
              created_at,
              round_agent_messages(
                id, agent_id, message, created_at
              ),
              round_user_messages(
                id, user_id, message, created_at
              )
            )
            `
          )
          .eq("id", parseInt(id))
          .order("created_at", { referencedTable: "rounds", ascending: false })
          .single();
        if (error) throw error;

        // (Optional) Fetch round count if needed
        const { data: roundCountData, error: roundCountError } = await supabase
          .from("rounds")
          .select("id")
          .eq("room_id", parseInt(id));
        if (roundCountError) throw roundCountError;
        const totalRounds = roundCountData?.length ?? 0;

        // Transform room data
        const transformedRoom: RoomWithRelations = {
          ...roomData,
          participants: roomData.participants?.[0]?.count ?? 0,
          agents:
            roomData.room_agents?.map((ra: any) => ({
              id: ra.agents.id,
              displayName: ra.agents.display_name,
              image: ra.agents.image_url,
              color: ra.agents.color,
            })) ?? [],
          roundNumber: totalRounds,
          agentMessages:
            roomData.rounds?.[0]?.round_agent_messages?.map((msg: any) => ({
              agentId: msg.agent_id,
              message: normalizeMessage(msg),
              createdAt: msg.created_at,
              agentDetails:
                roomData.room_agents?.find(
                  (ra: any) => ra.agents.id === msg.agent_id
                ) || null,
            })) ?? [],
        };

        setRoomData(transformedRoom);

        // Process API messages from the first round.
        const apiMsgs =
          roomData.rounds?.[0]?.round_user_messages?.map((msg: any) => ({
            userId: msg.user_id,
            message: normalizeMessage(msg),
            createdAt: msg.created_at,
            _timestamp: msg.created_at
              ? new Date(msg.created_at).getTime()
              : msg.content?.timestamp || Date.now(),
            source: "api",
            // Retain the entire content so that we can show additional details.
            content: msg.content || {},
          })) ?? [];
        apiMsgs.sort((a, b) => a._timestamp - b._timestamp);
        setMessages(apiMsgs);
      } catch (error) {
        console.error("Error loading room details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRoomDetails();
  }, [id]);

  // WebSocket connection and handling new messages
  const connectWebSocket = () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      throw new Error("Missing NEXT_PUBLIC_BACKEND_URL");
    }
    const wsUrl = backendUrl.replace(/^http/, "ws") + "/ws";

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        ws.send(
          JSON.stringify({
            type: "subscribe_room",
            author: currentUserId,
            timestamp: Date.now(),
            content: { roomId: Number(id) },
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const parsedMessage = JSON.parse(event.data);
          console.log("Received message:", parsedMessage);
          const newMsg = {
            ...parsedMessage,
            message: normalizeMessage(parsedMessage),
            _timestamp: parsedMessage.content?.timestamp || Date.now(),
            source: "socket",
          };
          setMessages((prev) => {
            const updated = [...prev, newMsg];
            return updated.length > 50
              ? updated.slice(updated.length - 50)
              : updated;
          });
        } catch (err) {
          console.error("Failed to parse websocket message", err);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        if (isMountedRef.current) {
          console.log("Attempting to reconnect in 5 seconds...");
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
        }
      };
    } catch (err) {
      console.error("WebSocket connection failed:", err);
      if (isMountedRef.current) {
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    connectWebSocket();
    return () => {
      isMountedRef.current = false;
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
    };
  }, [id]);

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
          {/* Left Section */}
          <div className="w-[65%] flex flex-col gap-6">
            <h1 className="text-4xl font-bold truncate text-center">
              {roomData.name}
            </h1>
            {/* Agents Display */}
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
                      No agents in this round
                    </span>
                  )}
                </div>
              </div>
            </div>
            {/* Agent Chat */}
            <div className="flex-1 bg-card rounded-lg overflow-hidden">
              <AgentChat
                className="h-full"
                showHeader={false}
                messages={roomData.agentMessages}
              />
            </div>
          </div>
          {/* Right Section */}
          <div className="w-[35%] flex flex-col gap-6">
            {/* Room Details */}
            <div className="h-[20%] bg-card rounded-lg p-4">
              <div className="h-full bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground text-lg gap-y-1">
                <span>Room ID: {roomData.id}</span>
                <span className="text-3xl font-bold bg-[#E97B17] text-white py-3 px-4">
                  {timeLeft}
                </span>
                <span className="text-lg font-semibold">
                  {roomData.participants} Participants
                </span>
              </div>
            </div>
            {/* User Messages */}
            <div className="flex flex-col bg-card rounded-lg p-4 overflow-y-auto">
              <div
                className="flex-1 bg-muted rounded-lg p-3 flex flex-col overflow-y-auto"
                ref={scrollContainerRef}
              >
                {messages.length === 0 ? (
                  <span className="text-gray-400">No user messages yet</span>
                ) : (
                  messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-2"
                    >
                      {/* Show additional details */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-400 rounded-full flex justify-center items-center">
                            {msg.content?.author || msg.userId || "U"}
                          </div>
                          <div className="ml-2">
                            {/* <span className="text-white">
                              {msg.content?.author || msg.userId || "Unknown"}: 
                            </span> */}
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
                className="p-2 bg-gray-800 text-white rounded-lg mt-4"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
