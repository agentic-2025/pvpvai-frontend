import type { Tables } from "./database.types";

export type Agent = Tables<"agents">;
export type Room = Tables<"rooms">;
export type RoomAgent = Tables<"room_agents">;
export type RoundAgentMessage = Tables<"round_agent_messages">;

export interface RoomWithRelations extends Room {
  participants: number;
  round_ends_on?: string | null; // Add this property
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

export const roomTypes: RoomTypeName[] = [
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
