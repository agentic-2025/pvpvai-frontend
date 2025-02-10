import { z } from "zod";
import { PvpActionCategories, PvpActions } from "./pvp.types";

export enum WsMessageTypes {
  // Sent by: Users in room
  // Purpose: Request to start receiving messages for a room
  SUBSCRIBE_ROOM = "subscribe_room",
  // Sent by: Users in room
  // Purpose: Send a message to the public chat
  PUBLIC_CHAT = "public_chat",
  // Sent by: Single user
  // Purpose: Response to a health check from the WS Server
  HEARTBEAT = "heartbeat",
  // Sent by: Single user
  // Purpose: Get the total number of participants in the room to display in the UI
  PARTICIPANTS = "participants",

  // BELOW IS NOT YET IMPLEMENTED
  // Sent by: Agents in room
  // Purpose: Send a message to the other agents in the room
  AGENT_MESSAGE = "agent_message",

  // BELOW IS NOT YET IMPLEMENTED
  // Sent by: ???
  // Purpose: Send a GM message to agents, must be treated with the highest priority to ensure round progresses
  GM_MESSAGE = "gm_message",

  // Response to: Any WS input message
  // Recipients: Single user
  // Purpose: Send a message to an individual user to inform them of something, typically used to notify of a failed action they took or a system error
  SYSTEM_NOTIFICATION = "system_notification",

  // Response to: POST request to /rooms/:roomId/rounds/:roundId/observations
  // Recipients: Users
  // Purpose: Send an observation to all agents in the room
  // Dual purpose: Message is relayed to AI Chat to inform subscribed users of an observation presented to the agents
  OBSERVATION = "observation",

  // Response to: POST request to /rounds/:roundId/pvp
  // Recipients: Users
  // Purpose: Informs users that a PvP action has been applied to an agent, be it a direct action or a status effect
  PVP_ACTION_ENACTED = "pvp_action_enacted",

  // Response to: None (background process monitors when a PvP status is removed and notifies users)
  // Recipients: Users
  // Purpose: Informs users that a PvP status has been removed from an agent
  PVP_STATUS_REMOVED = "pvp_status_removed",

  // Response to: None (background process monitors when a PvP status is removed and notifies users)
  // Recipients: Users
  // Purpose: Informs users that a PvP status has been removed from an agent
  AGENT_DECISION = "agent_decision",
  AGENT_NUDGE = "agent_nudge",
}

export const isSupportedInAiChat = (messageType: WsMessageTypes) => {
  return (
    messageType === WsMessageTypes.AGENT_MESSAGE ||
    messageType === WsMessageTypes.OBSERVATION ||
    messageType === WsMessageTypes.GM_MESSAGE ||
    messageType === WsMessageTypes.PVP_ACTION_ENACTED ||
    messageType === WsMessageTypes.PVP_STATUS_REMOVED ||
    messageType === WsMessageTypes.AGENT_DECISION
  );
};

/*
  SUBSCRIBE ROOM MESSAGES SCHEMA:
  Sent by:
    - WS: Users on room load over WS
  Received by:
    - Single user: subscribeRoomOutputMessageSchema
  Supported by:
    - WS exclusive
  Purpose: Gives the user the number of participants in the room
*/
export const subscribeRoomInputMessageSchema = z.object({
  messageType: z.literal(WsMessageTypes.SUBSCRIBE_ROOM),
  content: z.object({
    roomId: z.number(),
  }),
});

export const subscribeRoomOutputMessageSchema = subscribeRoomInputMessageSchema; //Passthrough

/*
  HEARTBEAT MESSAGES SCHEMA:
  Sent by:
    - WS: Users send this in response to a heartbeat message from the server
  Received by:
    - Single user: heartbeatOutputMessageSchema
  Supported by:
    - WS exclusive
  Purpose: Keeps the user's connection alive
*/
export const heartbeatInputMessageSchema = z.object({
  messageType: z.literal(WsMessageTypes.HEARTBEAT),
  content: z.object({}),
});

export const heartbeatOutputMessageSchema = heartbeatInputMessageSchema; //Passthrough

/*
  OBSERVATION MESSAGES SCHEMA:
  Sent by: Oracle agents
  Received by:
    - Agents: observationMessageAgentOutputSchema
    - Users (AI Chat): observationMessageAiChatOutputSchema
  Supported by:
    - REST: POST /messages/observations
    - (TODO Not currently supported by WS)

  Purpose: Provide data from external sources to agents to help inform their decisions
*/
export enum ObservationType {
  WALLET_BALANCES = "wallet-balances",
  PRICE_DATA = "price-data",
  GAME_EVENT = "game-event",
}

export const observationMessageInputSchema = z.object({
  messageType: z.literal(WsMessageTypes.OBSERVATION),
  signature: z.string(),
  sender: z.string(),
  content: z.object({
    agentId: z.number().int().positive(), //The agent who sent the message
    timestamp: z.number(),
    roomId: z.number(), // Redundant with path, but kept here since this message is passthrough to AI Chat for frontend.
    roundId: z.number(),
    observationType: z.nativeEnum(ObservationType),
    data: z.any(), // TODO Tighten up this type later
  }),
});

// Only difference between input and output is that the output message will be signed by GM
export const observationMessageAgentOutputSchema =
  observationMessageInputSchema; // Message sent to agents
export const observationMessageAiChatOutputSchema =
  observationMessageInputSchema; // Message sent to player facing AI Chat

/*
  PUBLIC CHAT MESSAGES SCHEMA:
  Sent by:
    - Users
  Received by:
    - Users: publicChatMessageOutputSchema
  Supported by:
    - WS
  Purpose: Allow users to send messages to all participants in a room, rendered in Public Chat control
*/
export const publicChatMessageInputSchema = z.object({
  messageType: z.literal(WsMessageTypes.PUBLIC_CHAT),
  signature: z.string(),
  sender: z.string(),
  content: z.object({
    timestamp: z.number(),
    roomId: z.number(),
    roundId: z.number(),
    text: z.string(),
  }),
});
export const publicChatMessageOutputSchema = publicChatMessageInputSchema; //Passthrough

/*
--- AGENT MESSAGES SCHEMA ---
  Sent by:
    - Agents
  Supported by:
    - REST (POST /messages/agentMessage)
  Received by:
    - Agents: agentMessageAgentOutputSchema
    - Users (AI Chat): agentMessageAiChatOutputSchema
  Note: PvP rules applied on message sent to agents, additional details sent to users in AI Chat
  Purpose: Messages from agents to the room and other agents.
*/
export const agentMessageInputSchema = z.object({
  messageType: z.literal(WsMessageTypes.AGENT_MESSAGE),
  signature: z.string(), // GM receives message signed by agent
  sender: z.string(),
  content: z.object({
    timestamp: z.number(),
    roomId: z.number(),
    roundId: z.number(),
    agentId: z.number(),
    text: z.string(),
  }),
});

// Message sent to agents, only difference between input and output message is that the output message's signature will be from the GM
export const agentMessageAgentOutputSchema = agentMessageInputSchema;
// Message sent to AI Chat (players) includes PvP details
export const agentMessageAiChatOutputSchema = z.object({
  messageType: z.literal(WsMessageTypes.AGENT_MESSAGE),
  content: z.object({
    timestamp: z.number(),
    roomId: z.number(),
    roundId: z.number(),
    senderId: z.number(),
    originalMessage: agentMessageInputSchema,
    originalTargets: z.array(z.number()),
    postPvpMessages: z.record(z.string(), agentMessageAgentOutputSchema),
    pvpStatusEffects: z.record(z.string(), z.array(z.any())), //TODO replace with actual PvP status effect schema
  }),
});

/*
  SYSTEM NOTIFICATION SCHEMA:
  Sent by:
    - Nobody
  Received by:
    - Single User: systemNotificationOutputSchema
    - Single Agent: systemNotificationOutputSchema
  Supported by:
    - WS exclusive
  Purpose: Informs a user or agent of a failed action when they invoked the action over WS
  Note: As this cannot be received no input schema is needed.
*/
export const systemNotificationOutputSchema = z.object({
  messageType: z.literal(WsMessageTypes.SYSTEM_NOTIFICATION),
  content: z.object({
    timestamp: z.number(),
    roomId: z.number().optional(),
    roundId: z.number().optional(),
    text: z.string(),
    error: z.boolean(),
    originalMessage: z.any().optional(), // The original message that caused the notification to be sent
  }),
});

/*
  PARTICIPANTS MESSAGES SCHEMA:
  Sent by:
    - WS: Users on room load over WS
  Received by:
    - Single user: participantsOutputMessageSchema
    - Users in room: participantsOutputMessageSchema
  Supported by:
    - WS exclusive
  Purpose: Gives the user the number of participants in the room
*/
export const participantsInputMessageSchema = z.object({
  messageType: z.literal(WsMessageTypes.PARTICIPANTS),
  content: z.object({
    roomId: z.number().int().positive(),
  }),
});

export const participantsOutputMessageSchema = z.object({
  messageType: z.literal(WsMessageTypes.PARTICIPANTS),
  content: z.object({
    timestamp: z.number().int().positive(),
    roomId: z.number().int().positive(),
    count: z.number().int().nonnegative(),
  }),
});

/*
  GM MESSAGES SCHEMA:
  Sent by:
    - GM over ???
  Received by:
    - One or more agents: gmMessageAgentOutputSchema
    - All users in the room: gmMessageAiChatOutputSchema
  Purpose: Sent when the GM wants to send a message to all agents or all users in the room
*/
export const gmMessageInputSchema = z.object({
  messageType: z.literal(WsMessageTypes.GM_MESSAGE),
  signature: z.string(),
  sender: z.string(),
  content: z.object({
    gmId: z.number(),
    timestamp: z.number(),
    targets: z.array(z.number()), // List of agent ids to send the message to
    roomId: z.number(),
    roundId: z.number(),
    message: z.string(),
    deadline: z.number().optional(), // Time in which the Agent must respond to the GM message before slashing/kicking
    additionalData: z.record(z.string(), z.any()).optional(),
    ignoreErrors: z.boolean().optional().default(false), // There are a few checks that a GM can ignore, like if the round is open or not, in case of emergency
  }),
});
export const gmMessageAgentOutputSchema = gmMessageInputSchema; // GM messages are passthrough to agents
export const gmMessageAiChatOutputSchema = gmMessageInputSchema; // GM messages are passthrough to AI Chat

/*
  PVP_ACTION_ENACTED MESSAGES SCHEMA:
  Sent by:
  - WS: Backend
  Received by:
  - Users in the room: aiChatPvpActionEnactedOutputSchema
  - (TODO Agents with the clairvoyance buff)
  Purpose: Sent when the Backend (or GM?) performs a direct action on an agent or applies a status effect to an agent
  Note:
  - After the user has finished their wallet interaction, they may eagerly send a message to the backend saying they placed the transaction.
  - The backend can then echo the message to that user individually so the user gets early feedback when they took an action
 */
const durationOptionsSchema = z.union([
  z.literal(5),
  z.literal(10),
  z.literal(30),
]);

// Create schemas for each PvP action type
const amnesiaActionSchema = z.object({
  actionType: z.literal(PvpActions.AMNESIA),
  actionCategory: z.literal(PvpActionCategories.DIRECT_ACTION),
  parameters: z.object({
    target: z.string(),
  }),
});

const attackActionSchema = z.object({
  actionType: z.literal(PvpActions.ATTACK),
  actionCategory: z.literal(PvpActionCategories.DIRECT_ACTION),
  parameters: z.object({
    target: z.string(),
    message: z.string(),
  }),
});

const deceiveStatusSchema = z.object({
  actionType: z.literal(PvpActions.DECEIVE),
  actionCategory: z.literal(PvpActionCategories.STATUS_EFFECT),
  parameters: z.object({
    target: z.string(),
    duration: durationOptionsSchema,
    newPersona: z.string(),
  }),
});

const blindStatusSchema = z.object({
  actionType: z.literal(PvpActions.BLIND),
  actionCategory: z.literal(PvpActionCategories.STATUS_EFFECT),
  parameters: z.object({
    target: z.string(),
    duration: durationOptionsSchema,
  }),
});

const silenceStatusSchema = z.object({
  actionType: z.literal(PvpActions.SILENCE),
  actionCategory: z.literal(PvpActionCategories.STATUS_EFFECT),
  parameters: z.object({
    target: z.string(),
    duration: durationOptionsSchema,
  }),
});

const deafenStatusSchema = z.object({
  actionType: z.literal(PvpActions.DEAFEN),
  actionCategory: z.literal(PvpActionCategories.STATUS_EFFECT),
  parameters: z.object({
    target: z.string(),
    duration: durationOptionsSchema,
  }),
});

const poisonStatusSchema = z.object({
  actionType: z.literal(PvpActions.POISON),
  actionCategory: z.literal(PvpActionCategories.STATUS_EFFECT),
  parameters: z.object({
    target: z.string(),
    duration: durationOptionsSchema,
    find: z.string(),
    replace: z.string(),
    case_sensitive: z.boolean(),
  }),
});

// Combine all action schemas
const pvpActionSchema = z.discriminatedUnion("actionType", [
  amnesiaActionSchema,
  attackActionSchema,
  deceiveStatusSchema,
  blindStatusSchema,
  silenceStatusSchema,
  deafenStatusSchema,
  poisonStatusSchema,
]);

export type PvpAttackActionType = z.infer<typeof attackActionSchema>;
export type PvpDeceiveStatusType = z.infer<typeof deceiveStatusSchema>;
export type PvpBlindStatusType = z.infer<typeof blindStatusSchema>;
export type PvpSilenceStatusType = z.infer<typeof silenceStatusSchema>;
export type PvpDeafenStatusType = z.infer<typeof deafenStatusSchema>;
export type PvpPoisonStatusType = z.infer<typeof poisonStatusSchema>;
export type PvpAmnesiaActionType = z.infer<typeof amnesiaActionSchema>;

export type PvpAllAllowedParametersType =
  | PvpAttackActionType["parameters"]
  | PvpDeceiveStatusType["parameters"]
  | PvpBlindStatusType["parameters"]
  | PvpSilenceStatusType["parameters"]
  | PvpDeafenStatusType["parameters"]
  | PvpPoisonStatusType["parameters"];
export type PvpAllPvpActionsType = z.infer<typeof pvpActionSchema>;

// Update the pvpActionEnactedAiChatOutputSchema
export const pvpActionEnactedAiChatOutputSchema = z.object({
  messageType: z.literal(WsMessageTypes.PVP_ACTION_ENACTED),
  signature: z.string(),
  sender: z.string(),
  content: z.object({
    timestamp: z.number(),
    roomId: z.number(),
    roundId: z.number(),
    instigator: z.number(),
    instigatorAddress: z.string(),
    txHash: z.string(),
    fee: z.number().optional(),
    action: pvpActionSchema,
  }),
});

// Response to every POST request to /messages
export const messagesRestResponseSchema = z.object({
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
});

export type AllOutputSchemaTypes =
  | z.infer<typeof publicChatMessageOutputSchema>
  | z.infer<typeof participantsOutputMessageSchema>
  | z.infer<typeof systemNotificationOutputSchema>
  | z.infer<typeof agentMessageAiChatOutputSchema>
  | z.infer<typeof pvpActionEnactedAiChatOutputSchema>
  | z.infer<typeof gmMessageAiChatOutputSchema>
  | z.infer<typeof observationMessageAiChatOutputSchema>
  | z.infer<typeof heartbeatOutputMessageSchema>
  | z.infer<typeof subscribeRoomOutputMessageSchema>
  | z.infer<typeof agentDecisionAiChatOutputSchema>;

// All types of messages that the backend can receive
export type AllInputSchemaTypes =
  | z.infer<typeof observationMessageInputSchema>
  | z.infer<typeof agentMessageInputSchema>
  | z.infer<typeof publicChatMessageInputSchema>
  | z.infer<typeof participantsInputMessageSchema>;

// All types of messages that will be sent to/received by agents
export type AllAgentFacingMessageSchemaTypes =
  | z.infer<typeof observationMessageAgentOutputSchema>
  | z.infer<typeof agentMessageAgentOutputSchema>
  | z.infer<typeof gmMessageAgentOutputSchema>;
//TODO GM message type will go here;

// All types of messages that will be sent to/received by users to render in AI Chat
export type AllAiChatMessageSchemaTypes =
  | z.infer<typeof observationMessageAiChatOutputSchema>
  | z.infer<typeof agentMessageAiChatOutputSchema>
  | z.infer<typeof gmMessageAiChatOutputSchema>
  | z.infer<typeof pvpActionEnactedAiChatOutputSchema>
  | z.infer<typeof agentDecisionAiChatOutputSchema>;
// | z.infer<typeof aiChatPvpStatusRemovedOutputSchema>;
//TODO PVP and GM message types will go here;

enum DecisionType {
  BUY = 1,
  SELL = 2,
  HOLD = 3,
}

export const agentDecisionAiChatOutputSchema = z.object({
  messageType: z.literal(WsMessageTypes.AGENT_DECISION),
  signature: z.string(),
  sender: z.string(),
  content: z.object({
    timestamp: z.number(),
    roomId: z.number(),
    roundId: z.number(),
    agentId: z.number(),
    decision: z.nativeEnum(DecisionType),
  }),
});
