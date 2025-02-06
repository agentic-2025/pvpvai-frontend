import AnimatedBackground from "@/components/ui/animated-tabs";
import { animated, useTransition } from "@react-spring/web";
import { useState } from "react";
import { RoomTableRow } from "./RoomTableRow";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tables } from "@/lib/database.types";
import { CreateRoomModal } from "./CreateRoomModal";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";

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

export const roomTypeMapping: { [key: number]: RoomTypeName } = {
  1: "Buy / Hold / Sell",
  2: "Long / Short",
  3: "Just Chat",
};

interface RoomTableProps {
  rooms: Tables<"rooms">[];
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

  // Determine if Buy Sell rooms are selected
  const isBuySell = selectedType === "Buy / Hold / Sell";

  const { isConnected } = useAccount();

  // Filter rooms based on the selected room type
  const filteredRooms =
    selectedType === "All"
      ? rooms
      : rooms.filter((room) => roomTypeMapping[room.type_id] === selectedType);

  const handleTypeChange = (value: string | null) => {
    if (!value) return;
    const newType = value as RoomTypeName | "All";
    const currentIndex = roomTypes.indexOf(selectedType);
    const newIndex = roomTypes.indexOf(newType);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setSelectedType(newType);
    onRoomTypeChange?.(newType);
  };

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

      <div
        className="overflow-hidden relative"
        style={{ height: `${filteredRooms.length * 80 + 110 + 32}px` }}
      >
        {cardTransition((style, item) => (
          <AnimatedCard
            style={{
              ...style,
              position: "absolute",
              width: "100%",
              top: 0,
              left: 0,
            }}
            className="bg-secondary/20 px-4 pt-2 pb-4 rounded-[calc(var(--radius))]"
          >
            <Table>
              <TableHeader>
                <TableRow className="border-b-[6px] border-gray-300 dark:border-gray-400">
                  <TableHead className="text-xl font-bold text-gray-700 dark:text-gray-200 pl-6 py-4 w-[400px]">
                    Id
                  </TableHead>
                  <TableHead className="text-xl font-bold text-gray-700 dark:text-gray-200 pl-6 py-4 w-[400px]">
                    Name
                  </TableHead>
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
      <CreateRoomModal open={createRoomOpen} onOpenChange={setCreateRoomOpen} />
    </div>
  );
}
