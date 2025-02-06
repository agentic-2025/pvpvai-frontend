"use client";

import Loader from "@/components/loader";
import supabase from "@/lib/config";
import { RoomTable, RoomWithRelations } from "@/stories/RoomTable";
import { FC, useEffect, useState } from "react";

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
            id,
            name,
            type_id,
            image_url,
            color,
            chain_id,
            rounds(
              id,
              created_at,
              round_agents!inner(
                agent:agent_id(
                  id,
                  display_name,
                  image_url,
                  color
                )
              )
            )
         `
          )
          // .eq("rounds.active", true)
          // .order("rounds.created_at", { ascending: false })
          // .limit(1, { foreignTable: "rounds" })

          .throwOnError();

        if (error) {
          console.error("Error loading rooms:", error);
          throw error;
        }

        // Transform the data to match our expected format
        const transformedRooms: RoomWithRelations[] = roomsData.map(
          (room: any) => ({
            ...room,
            participants: room.participants?.[0]?.count ?? 0,
            agents:
              room.rounds?.[0]?.round_agents?.map((ra: any) => ({
                id: ra.agent.id,
                displayName: ra.agent.display_name,
                image: ra.agent.image_url,
                color: ra.agent.color,
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
    return <Loader />;
  }

  return (
    <div className="container mx-auto py-8 min-h-screen">
      <RoomTable rooms={rooms} showTabs={true} />
    </div>
  );
};

export default RoomsPage;
