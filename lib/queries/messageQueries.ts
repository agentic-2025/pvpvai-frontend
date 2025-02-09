import {
  agentDecisionAiChatOutputSchema,
  agentMessageAiChatOutputSchema,
  AllAiChatMessageSchemaTypes,
  gmMessageAiChatOutputSchema,
  observationMessageAiChatOutputSchema,
  publicChatMessageInputSchema,
  publicChatMessageOutputSchema,
  pvpActionEnactedAiChatOutputSchema,
  WsMessageTypes,
} from "@/lib/backend.types";
import supabase from "@/lib/config";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { z } from "zod";
import { Json } from "../database.types";

const parseAgentMessage = (
  message: Json
): AllAiChatMessageSchemaTypes | null => {
  try {
    console.log("Received message:", message);
    if (!message) {
      throw new Error("Message is null");
    }
    if (typeof message === "string") {
      message = JSON.parse(message);
    }
    const parsedMessage = message as AllAiChatMessageSchemaTypes;
    console.log("Parsed message:", message);
    console.log("Message type:", parsedMessage.messageType);

    switch (parsedMessage.messageType) {
      case WsMessageTypes.GM_MESSAGE:
        console.log("GM message", parsedMessage);
        return gmMessageAiChatOutputSchema.parse(parsedMessage);
      case WsMessageTypes.AGENT_MESSAGE:
        return agentMessageAiChatOutputSchema.parse(parsedMessage);
      case WsMessageTypes.OBSERVATION:
        return observationMessageAiChatOutputSchema.parse(parsedMessage);
      case WsMessageTypes.PVP_ACTION_ENACTED:
        return pvpActionEnactedAiChatOutputSchema.parse(parsedMessage);
      case WsMessageTypes.AGENT_DECISION:
        console.log("Agent decision", parsedMessage);
        return agentDecisionAiChatOutputSchema.parse(parsedMessage);
      default:
        console.log(
          "Error, unsupported message type, will exclude message from display:",
          parsedMessage
        );
        return null;
      // throw new Error(`Unsupported message type: ${parsedMessage}`);
    }
  } catch (error) {
    console.error("Error parsing message", JSON.stringify(error));
    throw error;
  }
};

const parsePublicChatMessage = (
  message: Json
): z.infer<typeof publicChatMessageInputSchema> | null => {
  try {
    if (!message) {
      console.error("Message is null");
      return null;
    }
    if (typeof message === "string") {
      message = JSON.parse(message);
    }
    console.log("public chat message", message);

    return publicChatMessageInputSchema.parse(message);
  } catch (error) {
    console.error("Error parsing public chat message", JSON.stringify(error));
    return null;
  }
};

export const useRoundAgentMessages = (
  roundId: number
): UseQueryResult<AllAiChatMessageSchemaTypes[]> => {
  return useQuery({
    queryKey: ["roundAgentMessages", roundId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("round_agent_messages")
        .select(`message`)
        .eq("round_id", roundId)
        .in("message->>messageType", [
          WsMessageTypes.GM_MESSAGE,
          WsMessageTypes.AGENT_MESSAGE,
          WsMessageTypes.OBSERVATION,
          WsMessageTypes.PVP_ACTION_ENACTED,
          WsMessageTypes.PVP_STATUS_REMOVED,
          WsMessageTypes.AGENT_DECISION,
        ])
        .order("created_at", { ascending: false })
        .limit(100); //TODO, implement infinite scroll or pagination later
      if (error) {
        console.error("Error fetching round agent messages", error);
        throw error;
      }
      console.log("data", data);
      const res: AllAiChatMessageSchemaTypes[] = [];
      for (const row of data) {
        try {
          const parsedMessage = parseAgentMessage(row.message);
          //Failed parseAgentMessage will return null, meaning the message is not supported and will be excluded from display
          if (parsedMessage) {
            res.push(parsedMessage);
          }
        } catch (error) {
          console.error(
            "Error parsing message:",
            error,
            "row:",
            row,
            "skipping..."
          );
        }
      }
      return res;
    },
    enabled: !!roundId,
  });
};

export const useRoundUserMessages = (
  roundId: number
): UseQueryResult<z.infer<typeof publicChatMessageOutputSchema>[]> => {
  return useQuery({
    queryKey: ["roundUserMessages", roundId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("round_user_messages")
        .select(`message`)
        .eq("message->>messageType", WsMessageTypes.PUBLIC_CHAT)
        .eq("round_id", roundId)
        .order("created_at", { ascending: false })
        .limit(100); //TODO, implement infinite scroll or pagination later

      if (error) {
        console.error("Error fetching round user messages", error);
        throw error;
      }

      const res: z.infer<typeof publicChatMessageOutputSchema>[] = [];
      for (const row of data) {
        try {
          const parsedMessage = parsePublicChatMessage(row.message);
          //Failed parsePublicChatMessage will return null, meaning the message is not supported and will be excluded from display
          if (parsedMessage) {
            res.push(parsedMessage);
          }
        } catch (error) {
          console.error(
            "Error parsing public chat message:",
            error,
            "row:",
            row,
            "skipping..."
          );
        }
      }
      return res;
    },
    enabled: !!roundId,
  });
};
