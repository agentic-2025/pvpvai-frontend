"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import supabase from "@/lib/config";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AgentAvatar } from "@/stories/AgentAvatar";
import Loader from "@/components/loader";
import { formatDistanceToNow } from "date-fns";
import { Copy } from "lucide-react";
import AnimatedBackground from "@/components/ui/animated-tabs";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Database } from "@/lib/database.types";
import Image from "next/image";
import { chainMetadata } from "@/lib/utils";
import { roomTypeMapping } from "@/lib/room-types";

export type Room = Database["public"]["Tables"]["rooms"]["Row"];
export type Agent = Database["public"]["Tables"]["agents"]["Row"];

const viewOptions = ["Agent Info", "Rooms"];

export default function AgentSummary() {
  const params = useParams();
  const id = params.id;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedView, setSelectedView] = useState("Agent Info");
  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch agent data
  useEffect(() => {
    const fetchAgent = async () => {
      const { data, error } = await supabase
        .from("agents")
        .select(
          `
          id,
          image_url,
          color,
          display_name,
          single_sentence_summary,
          platform,
          endpoint,
          status,
          type,
          earnings,
          character_card,
          last_health_check,
          created_at,
          creator_id,
          eth_wallet_address,
          sol_wallet_address,
          updated_at
        `
        )
        .eq("id", Number(id))
        .single();

      if (error) {
        setError(error.message);
      } else {
        setAgent(data);
      }
      setLoading(false);
    };

    fetchAgent();
  }, [id]);

  // When in "Rooms" view, fetch the rooms where the agent is present.
  useEffect(() => {
    if (selectedView === "Rooms" && agent) {
      const fetchRooms = async () => {
        setRoomsLoading(true);
        const { data, error } = await supabase
          .from("room_agents")
          .select(
            `
            room_id,
            rooms (
              id,
              name,
              chain_id,
              created_at
            )
          `
          )
          .eq("agent_id", agent.id);

        if (error) {
          console.error("Error fetching rooms:", error);
        } else if (data) {
          // Map each join row to its related room.
          const roomList: Room[] = data.map((item: any) => item.rooms);
          setRooms(roomList);
        }
        setRoomsLoading(false);
      };

      fetchRooms();
    }
  }, [selectedView, agent]);

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-red-500">
        Error: {error}
      </div>
    );
  if (!agent)
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-gray-700">
        No agent found with id {id}
      </div>
    );

  let characterCard: { [key: string]: any } = {};
  try {
    characterCard = agent?.character_card
      ? JSON.parse(agent.character_card)
      : {};
  } catch (e) {
    console.error("Error parsing character_card:", e);
  }

  return (
    <div className="min-h-screen py-8">
      <Card className="p-8 max-w-4xl mx-auto bg-secondary/20 text-gray-200 shadow-2xl rounded-lg">
        {/* Agent Basic Info */}
        <div className="flex flex-col items-center border-secondary-foreground mb-2">
          <AgentAvatar
            id={agent.id}
            name={agent.display_name}
            imageUrl={agent.image_url || "/default-agent.png"}
            borderColor={agent.color}
            variant="lg"
          />
          <h2 className="text-4xl font-extrabold mb-2">{agent.display_name}</h2>
          <p className="text-xl text-center max-w-xl">
            {agent.single_sentence_summary}
          </p>
        </div>

        <div className="mb-6 bg-secondary/25 p-1.5 rounded-lg w-fit">
          <AnimatedBackground
            className="bg-secondary/50 rounded-md"
            defaultValue={selectedView}
            onValueChange={setSelectedView}
          >
            {viewOptions.map((option) => (
              <button
                key={option}
                data-id={option}
                className="px-6 py-3 rounded-md text-lg font-medium transition-colors"
              >
                {option}
              </button>
            ))}
          </AnimatedBackground>
        </div>

        {selectedView === "Agent Info" && (
          <>
            <div>
              <Label className="font-semibold text-xl text-gray-200">
                Agent Information:
              </Label>
              <div className="mb-6 bg-muted/80 p-4 rounded-lg shadow-md mt-2">
                <div className="text-base space-y-2">
                  <p className="text-gray-400">
                    <span className="font-semibold text-gray-200">
                      Platform:
                    </span>{" "}
                    {agent.platform}
                  </p>
                  <p className="text-gray-400">
                    <span className="font-semibold text-gray-200">
                      Endpoint:
                    </span>{" "}
                    {agent.endpoint}
                  </p>
                  <p className="text-gray-400">
                    <span className="font-semibold text-gray-200">
                      Earnings:
                    </span>{" "}
                    {agent.earnings !== null ? `${agent.earnings} USDC` : "N/A"}
                  </p>
                  <p className="text-gray-400">
                    <span className="font-semibold text-gray-200">
                      Last Health Check:
                    </span>{" "}
                    {agent.last_health_check
                      ? formatDistanceToNow(new Date(agent.last_health_check), {
                          addSuffix: true,
                        })
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Character Card JSON Section */}
            <div>
              <Label className="font-semibold text-lg text-gray-100">
                Character Card (JSON):
              </Label>
              <div className="scroll-thin bg-muted/80 p-4 rounded-md text-sm max-w-full max-h-96 overflow-auto text-white mt-2 relative">
                <button
                title="Copy JSON"
                  className="absolute top-0 right-0 m-4"
                  onClick={() =>
                    navigator.clipboard.writeText(
                      JSON.stringify(characterCard, null, 2)
                    )
                  }
                >
                  <Copy className="size-4 text-secondary-foreground/70 hover:text-secondary-foreground/90" />
                </button>
                <pre className="whitespace-pre-wrap break-words scroll-thin">
                  {JSON.stringify(characterCard, null, 2)}
                </pre>
              </div>
            </div>
          </>
        )}

        {selectedView === "Rooms" && (
          <>
            <Label className="font-semibold text-xl text-gray-200 mb-4">
              Rooms Where This Agent Is Present:
            </Label>
            <div className="mt-4">
              {roomsLoading ? (
                <p className="text-center">Loading rooms...</p>
              ) : rooms.length === 0 ? (
                <p className="text-center">No rooms found for this agent.</p>
              ) : (
                <div className="overflow-auto bg-secondary/20 px-4 pt-2 pb-4 rounded-[calc(var(--radius))]">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="border-b border-gray-300 dark:border-gray-400">
                        <TableHead className="text-base font-bold text-gray-700 dark:text-gray-200 pl-6 py-4 w-[400px]">
                          Name
                        </TableHead>
                        <TableHead className="text-center text-base font-bold text-gray-700 dark:text-gray-200 pl-6 py-4 w-[400px]">
                          Type
                        </TableHead>
                        <TableHead className="text-center text-base font-bold text-gray-700 dark:text-gray-200 pl-6 py-4 w-[400px]">
                          Network
                        </TableHead>
                        <TableHead className="text-center text-base font-bold text-gray-700 dark:text-gray-200 pl-6 py-4 w-[400px]">
                          Created At
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rooms.map((room) => (
                        <TableRow key={room.id} className="hover:bg-muted">
                          <TableCell className="px-4 py-2">
                            {room.name}
                          </TableCell>
                          <TableCell className="px-4 py-2 text-center">
                            {roomTypeMapping[room.type_id]}
                          </TableCell>
                          <TableCell className="px-4 py-2">
                            {room.chain_id &&
                              chainMetadata[room.chain_id]?.icon && (
                                <Image
                                  src={chainMetadata[room.chain_id]?.icon}
                                  alt={chainMetadata[room.chain_id]?.name}
                                  className="size-6 mx-auto"
                                  width={2000}
                                  height={2000}
                                />
                              )}
                          </TableCell>
                          <TableCell className="px-4 py-2 text-center">
                            {formatDistanceToNow(new Date(room.created_at), {
                              addSuffix: true,
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
