"use client";
import Loader from "@/components/loader";
import supabase from "@/lib/config";
import { AgentChat } from "@/stories/AgentChat";
import { BuySellGameAvatarInteraction } from "@/stories/BuySellGameAvatarInteraction";
import { RoomWithRelations } from "@/stories/RoomTable";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

export default function RoomDetailPage() {
  const params = useParams();
  const id = params.id;
  const [roomData, setRoomData] = useState<RoomWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [userMessages, setUserMessages] = useState<any[]>([]);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<
    number | null
  >(null);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [userMessages]);

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
    
            room_agents!inner(
              id,
              agents(
                id,
                display_name,
                image_url,
                color
              )
            ),
    
            users:user_rooms(count),
    
            rounds!inner(
              id,
              created_at,
              round_agent_messages!inner(
                id, agent_id, message, created_at
              ),
              round_user_messages!inner(
                id, user_id, message, created_at
              )
            )
          `
          )
          .eq("id", parseInt(id))
          .order("created_at", { referencedTable: "rounds", ascending: false })
          .single();

        if (error) throw error;

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

  // WebSocket connection for real-time user messages
  useEffect(() => {
    const initWebSocket = () => {
      const ws = new WebSocket("ws://localhost:3000/ws");

      ws.onopen = () => {
        console.log("WebSocket connected");
        ws.send(JSON.stringify({ type: "subscribe_room", roomId: id }));
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log("Received message:", message);
        const timestamp = Date.now();
        setLastMessageTimestamp(timestamp);
        setUserMessages((prev) => [
          { ...message, _timestamp: timestamp },
          ...prev,
        ]);
      };

      ws.onerror = (error) => console.error("WebSocket error:", error);
      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setTimeout(initWebSocket, 5000);
      };

      setWsConnection(ws);
    };

    initWebSocket();

    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [id]);

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
