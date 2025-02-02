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
import { useEffect, useRef, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

export default function RoomDetailPage() {
  const params = useParams();
  const id = params.id;
  const [roomData, setRoomData] = useState<RoomWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [userMessages, setUserMessages] = useState<any[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const maxRetries = 5;

  // WebSocket setup
  const socketUrl = `${process.env.NEXT_PUBLIC_BACKEND_WS_URL}`;

  const { sendMessage, lastMessage, readyState, getWebSocket } =
    useWebSocket<WSMessageOutput>(socketUrl, {
      shouldReconnect: (/*closeEvent*/) => {
        // Only attempt to reconnect if we haven't reached max retries
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
        // Reset retry count on successful connection
        const ws = getWebSocket();
        (ws as any).retries = 0;

        // Subscribe to room
        sendMessage(
          JSON.stringify({
            type: WsMessageType.SUBSCRIBE_ROOM,
            author: 3,
            timeStamp: Date.now(),
            content: {
              roomId: id,
            },
          })
        );

        toast({
          title: "Connected",
          description: "Successfully connected to the chat server",
        });
      },
      onMessage: (event) => {
        console.log("Received message:", event.data);
        if (event.data.type === WsMessageType.PUBLIC_CHAT) {
          setUserMessages((prev) => [
            { ...event.data, _timestamp: Date.now() },
            ...prev,
          ]);
        }
        if (event.data.type === WsMessageType.AI_CHAT) {
          console.log(
            "Received AI chat message, routing to user messages for now"
          );
          setUserMessages((prev) => [
            { ...event.data, _timestamp: Date.now() },
            ...prev,
          ]);
        }
        if (event.data.type === WsMessageType.SYSTEM_NOTIFICATION) {
          if (event.data.content.error) {
            toast({
              variant: "destructive",
              title: "Encountered an error",
              description: event.data.content.text,
            });
            setUserMessages((prev) => [
              { ...event.data, _timestamp: Date.now() },
              ...prev,
            ]);
          }
        }
      },
      onClose: () => {
        console.log("WebSocket disconnected");
        // Increment retry count
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

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [userMessages]);

  useEffect(() => {
    const loadRoomDetails = async () => {
      if (!id || Array.isArray(id)) return;
      try {
        const { data: roomData, error } = await supabase
          .from("rooms")
          .select(
            `
           *,
            participants:user_rooms(count),
    
            room_agents!inner(
              id,
              agents(
                id,
                display_name,
                image_url,
                color
              )
            ),
            users:user_rooms(count)
            rounds(count)
          `
          )
          .eq("id", parseInt(id))
          .single();
        console.log("roomData", roomData);
        if (error) {
          console.error("Error loading room details:", error);
          throw error;
        }

        console.log("Fetched room");

        const { data: roundCountData, error: roundCountError } = await supabase
          .from("rounds")
          .select("id")
          .eq("room_id", parseInt(id));

        if (roundCountError) throw roundCountError;

        const totalRounds = roundCountData?.length ?? 0;

        const normalizeMessage = (msg: any) =>
          typeof msg.message === "object" && msg.message?.text
            ? msg.message.text
            : msg.message;

        // Transform the fetched data
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
                  (ra) => ra.agents.id === msg.agent_id
                ) || null,
            })) ?? [],
        };

        setRoomData(transformedRoom);

        // Set user messages
        setUserMessages(
          roomData.rounds?.[0]?.round_user_messages?.map((msg: any) => ({
            userId: msg.user_id,
            message: normalizeMessage(msg),
            createdAt: msg.created_at,
          })) ?? []
        );
      } catch (error) {
        console.error("Error loading room details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRoomDetails();
  }, [id]);

  // Connection status for debugging
  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  console.log("WebSocket status:", connectionStatus);

  if (loading) {
    return <Loader />;
  }

  if (!roomData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span>Room not found</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="container mx-auto p-4 bg-secondary/50 rounded-xl">
        <div className="flex gap-6 h-[calc(100vh-4rem)]">
          {/* Left Section - 65% */}
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

          {/* Right Section - 35% */}
          <div className="w-[35%] flex flex-col gap-6">
            {/* Room Details Card */}
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
                {userMessages.length === 0 ? (
                  <span className="text-gray-400">No user messages yet</span>
                ) : (
                  userMessages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <p className="text-white">{msg.message}</p>
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
