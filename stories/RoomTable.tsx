"use client";

import React, { useState } from "react";
import { animated, useTransition } from "@react-spring/web";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import AnimatedBackground from "@/components/ui/animated-tabs";
import { CreateRoomModal } from "./CreateRoomModal";
import { RoomTableRow } from "./RoomTableRow";
import { useAccount } from "wagmi";
import type { Tables } from "@/lib/database.types";

/** Types from your code */
export type Agent = Tables<"agents">;
export type Room = Tables<"rooms">;
export type RoomAgent = Tables<"room_agents">;
export type RoundAgentMessage = Tables<"round_agent_messages">;

export interface RoomWithRelations extends Room {
  participants: number;
  agents: {
    id: number;
    displayName: string;
    image: string | null;
    color: string;
  }[];
  roundNumber: number;
  agentMessages: {
    agentId: number;
    message: string;
    createdAt: string;
    agentDetails: {
      id: number;
      displayName: string;
      image: string | null;
      color: string;
    } | null;
  }[];
}

export type RoomTypeName =
  | "Buy / Hold / Sell"
  | "Long / Short"
  | "Just Chat"
  | "All";

const roomTypes: RoomTypeName[] = [
  "All",
  "Buy / Hold / Sell",
  "Long / Short",
  "Just Chat",
];

/** Maps type_id -> user-friendly label */
export const roomTypeMapping: { [key: number]: RoomTypeName } = {
  1: "Buy / Hold / Sell",
  2: "Long / Short",
  3: "Just Chat",
};

/** Props for <RoomTable /> */
interface RoomTableProps {
  rooms: RoomWithRelations[]; // use your own type
  roomType?: RoomTypeName | "All";
  showTabs?: boolean;
  onRoomTypeChange?: (type: RoomTypeName | "All") => void;
}

const AnimatedCard = animated(Card);

export function RoomTable({
  rooms,
  roomType = "All",
  showTabs = false,
  onRoomTypeChange,
}: RoomTableProps) {
  const [selectedType, setSelectedType] = useState<RoomTypeName | "All">(
    roomType
  );
  const [direction, setDirection] = useState(0);
  const [createRoomOpen, setCreateRoomOpen] = useState(false);

  // If using wagmi for wallet connection
  const { isConnected } = useAccount();

  // Figure out if "Buy / Hold / Sell" is selected
  const isBuySell = selectedType === "Buy / Hold / Sell";

  // Filter rooms in memory, no new fetch
  const filteredRooms =
    selectedType === "All"
      ? rooms
      : rooms.filter((room) => roomTypeMapping[room.type_id] === selectedType);

  // Called whenever user selects a new type
  const handleTypeChange = (value: string | null) => {
    if (!value) return;
    const newType = value as RoomTypeName | "All";
    const currentIndex = roomTypes.indexOf(selectedType);
    const newIndex = roomTypes.indexOf(newType);

    // For the spring transition
    setDirection(newIndex > currentIndex ? 1 : -1);

    // Update local filter state
    setSelectedType(newType);

    // If parent wants to know about the change
    onRoomTypeChange?.(newType);
  };

  // Animate transition between filter states
  const cardTransition = useTransition(
    [{ rooms: filteredRooms, key: selectedType }],
    {
      from: { opacity: 0, transform: `translateX(${direction * 100}%)` },
      enter: { opacity: 1, transform: "translateX(0%)" },
      leave: { opacity: 0, transform: `translateX(${direction * -100}%)` },
      config: {
        tension: 350,
        friction: 30,
        clamp: true,
      },
      keys: (item) => item.key,
    }
  );

  return (
    <div className="space-y-8">
      {/* Tabs / Filters */}
      <div className="flex justify-between items-center">
        {showTabs && (
          <div className="flex justify-center">
            <div className="bg-secondary/30 p-1.5 rounded-lg">
              <AnimatedBackground
                className="bg-secondary/50 rounded-md"
                defaultValue={selectedType}
                onValueChange={handleTypeChange}
              >
                {roomTypes.map((type) => (
                  <button
                    key={type}
                    data-id={type}
                    className="px-6 py-3 rounded-md text-xl font-medium transition-colors"
                  >
                    {type}
                  </button>
                ))}
              </AnimatedBackground>
            </div>
          </div>
        )}
        <Button
          onClick={() => setCreateRoomOpen(true)}
          disabled={!isConnected}
          className="px-4 py-2 h-fit bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Create Room
        </Button>
      </div>

      {/* Animated Table for Filtered Rooms */}
      <div className="overflow-hidden relative">
        {cardTransition((style, item) => (
          <AnimatedCard
            style={{
              ...style,
              position: "relative",
              width: "100%",
            }}
            className="bg-secondary/20 px-4 pt-2 pb-4 rounded-[calc(var(--radius))]"
          >
            <Table>
              <TableHeader>
                <TableRow className="border-b-[6px] border-gray-300 dark:border-gray-400">
                  <TableHead className="text-xl font-bold text-gray-700 dark:text-gray-200 pl-6 py-4 w-fit">
                    # Id
                  </TableHead>
                  <TableHead className="text-xl font-bold text-gray-700 dark:text-gray-200 pl-6 py-4 w-[400px]">
                    Name
                  </TableHead>
                  {/* Hide Type column if it's a Buy/Hold/Sell table */}
                  {!isBuySell && (
                    <TableHead className="text-xl font-bold text-gray-700 dark:text-gray-200 py-4">
                      Type
                    </TableHead>
                  )}
                  <TableHead className="text-xl font-bold text-gray-700 dark:text-gray-200 py-4 text-center">
                    Participants
                  </TableHead>
                  <TableHead className="text-xl font-bold text-gray-700 dark:text-gray-200 text-center py-4 w-[150px]">
                    Network
                  </TableHead>
                  {isBuySell && (
                    <TableHead className="text-xl font-bold text-gray-700 dark:text-gray-200 py-4">
                      Token
                    </TableHead>
                  )}
                  <TableHead className="text-xl font-bold text-gray-700 dark:text-gray-200 text-center py-4 w-[150px]">
                    Next Round
                  </TableHead>
                  <TableHead className="text-xl font-bold text-gray-700 dark:text-gray-200 pr-6 py-4 w-[200px]">
                    Agents
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-lg [&_tr]:border-t [&_tr]:border-gray-300/60 dark:[&_tr]:border-gray-400/60">
                {item.rooms.map((room) => (
                  <RoomTableRow
                    key={room.id}
                    room={room}
                    showRoomType={!isBuySell}
                    showToken={isBuySell}
                  />
                ))}
              </TableBody>
            </Table>
          </AnimatedCard>
        ))}
      </div>

      {/* Modal (Create Room) */}
      <CreateRoomModal open={createRoomOpen} onOpenChange={setCreateRoomOpen} />
    </div>
  );
}
