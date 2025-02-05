"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/config";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { AgentAvatar } from "@/stories/AgentAvatar";
import Image from "next/image";
import { chainMetadata } from "@/lib/utils";
import { Database } from "@/lib/database.types";

// Define a type for Room with joined rounds and agents.
export type RoomWithRelations = {
  id: number;
  name: string;
  chain_id?: number;
  created_at: string;
  rounds: Array<{
    id: number;
    created_at: string;
    round_agents: Array<{
      agent: {
        id: number;
        display_name: string;
        image_url: string;
        color: string;
      };
    }>;
  }> | null;
};

export default function LatestRoomsTable() {
  const [rooms, setRooms] = useState<RoomWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      // Query the latest 5 rooms with a join to fetch rounds and agents.
      const { data, error } = await supabase
        .from("rooms")
        .select(
          `
          id,
          name,
          chain_id,
          created_at,
          rounds!inner(
            id,
            created_at,
            round_agents (
              agent:agents (
                id,
                display_name,
                image_url,
                color
              )
            )
          )
        `
        )
        // .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        setError(error.message);
      } else if (data) {
        setRooms(data as RoomWithRelations[]);
      }
      setLoading(false);
    };

    fetchRooms();
  }, []);

  // Create an array of 5 skeleton rows with static row numbers.
  const skeletonRows = Array.from({ length: 5 }).map((_, index) => (
    <TableRow key={index} className="h-16">
      <TableCell className="align-middle">{index + 1}</TableCell>
      <TableCell className="align-middle">
        <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
      </TableCell>
      <TableCell className="align-middle text-center">
        <div className="h-6 w-6 bg-gray-300 animate-pulse rounded-full inline-block"></div>
      </TableCell>
      <TableCell className="align-middle text-center">
        <div className="flex space-x-2">
          <div className="h-8 w-8 bg-gray-300 animate-pulse rounded-full"></div>
          <div className="h-8 w-8 bg-gray-300 animate-pulse rounded-full"></div>
        </div>
      </TableCell>
    </TableRow>
  ));

  return (
    <Table className="bg-transparent">
      <TableHeader>
        <TableRow className="">
          <TableHead className="text-left">#</TableHead>
          <TableHead className="text-left">Name</TableHead>
          <TableHead className="text-center">Network</TableHead>
          <TableHead className="text-center">Agents</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading
          ? skeletonRows
          : rooms.map((room, index) => {
              // Pick the most recent round (if available) by sorting rounds by created_at descending.
              const latestRound =
                room.rounds && room.rounds.length > 0
                  ? room.rounds.sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    )[0]
                  : null;
              return (
                <TableRow key={room.id} className="h-16">
                  {/* Row number */}
                  <TableCell className="align-middle">{index + 1}</TableCell>
                  {/* Room name */}
                  <TableCell className="align-middle">{room.name}</TableCell>
                  {/* Network: display an icon based on chain_id */}
                  <TableCell className="align-middle text-center">
                    {room.chain_id && chainMetadata[room.chain_id]?.icon ? (
                      <Image
                        src={chainMetadata[room.chain_id].icon}
                        alt={chainMetadata[room.chain_id].name}
                        className="w-6 h-6 inline-block"
                        width={24}
                        height={24}
                      />
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  {/* Agents: display AgentAvatar for each agent in the latest round */}
                  <TableCell className="align-middle text-center">
                    <div className="flex -space-x-2 justify-center">
                      {latestRound &&
                      latestRound.round_agents &&
                      latestRound.round_agents.length > 0
                        ? latestRound.round_agents.map(({ agent }) => (
                            <AgentAvatar
                              key={agent.id}
                              id={agent.id}
                              name={agent.display_name}
                              imageUrl={agent.image_url || "/default-agent.png"}
                              borderColor={agent.color}
                              variant="sm"
                            />
                          ))
                        : "No Agents"}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
      </TableBody>
    </Table>
  );
}
