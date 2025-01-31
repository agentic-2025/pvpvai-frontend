"use client";

import { supabase } from "@/lib/config";
import { RoomTable, RoomWithRelations } from "@/stories/RoomTable";
import { FC, useEffect, useState } from "react";

// Extend the room type to include the additional data we'll fetch

const RoomsPage: FC = () => {
  const [rooms, setRooms] = useState<RoomWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        // Get rooms with participant counts and active round agents
        const { data: roomsData, error } = await supabase
          .from("rooms")
          .select(
            `
            *,
            // Get participant count from user_rooms
            participants:user_rooms(count),
            // Get active round
            rounds!inner(
              id,
              // Get agents for the active round through round_agents
              round_agents!inner(
                agents(
                  id,
                  display_name,
                  image_url,
                  color
                )
              )
            )
          `
          )
          .eq("rounds.active", true)
          .throwOnError();

        if (error) throw error;

        // Transform the data to match our expected format
        const transformedRooms: RoomWithRelations[] = roomsData.map(
          (room: any) => ({
            ...room,
            participants: room.participants?.[0]?.count ?? 0,
            agents:
              room.rounds?.[0]?.round_agents?.map((ra: any) => ({
                id: ra.agents.id,
                displayName: ra.agents.display_name,
                image: ra.agents.image_url,
                color: ra.agents.color,
              })) ?? [],
          })
        );

        setRooms(transformedRooms);
      } catch (error) {
        console.error("Error loading rooms:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  if (loading) {
    return <div>Loading rooms...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <RoomTable rooms={rooms} showTabs={true} />
    </div>
  );
};

export default RoomsPage;
