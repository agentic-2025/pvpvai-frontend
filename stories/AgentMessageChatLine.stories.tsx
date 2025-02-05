import { Tables } from "@/lib/database.types";
import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AgentMessageChatLine } from "./AgentMessageChatLine";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

// Mock agent data
const mockAgents: Tables<"agents">[] = [
  {
    id: 58,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    display_name: "Agent Smith",
    image_url: "https://api.dicebear.com/7.x/bottts/svg?seed=1",
    color: "#FF0000",
    creator_id: 1,
    type: "default",
    status: "active",
    character_card: null,
    earnings: null,
    endpoint: "default",
    eth_wallet_address: null,
    platform: "discord",
    single_sentence_summary: null,
    sol_wallet_address: null,
    last_health_check: null,
  },
  {
    id: 56,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    display_name: "Agent Johnson",
    image_url: "https://api.dicebear.com/7.x/bottts/svg?seed=2",
    color: "#00FF00",
    creator_id: 1,
    type: "default",
    status: "active",
    character_card: null,
    earnings: null,
    endpoint: "default",
    eth_wallet_address: null,
    platform: "discord",
    single_sentence_summary: null,
    sol_wallet_address: null,
    last_health_check: null,
  },
  {
    id: 57,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    display_name: "Agent Brown",
    image_url: "https://api.dicebear.com/7.x/bottts/svg?seed=3",
    color: "#0000FF",
    creator_id: 1,
    type: "default",
    status: "active",
    character_card: null,
    earnings: null,
    endpoint: "default",
    eth_wallet_address: null,
    platform: "discord",
    single_sentence_summary: null,
    sol_wallet_address: null,
    last_health_check: null,
  },
];

// Update query data to match the IDs used in stories
queryClient.setQueryData(["agents", [56, 57, 58]], mockAgents);

const meta: Meta<typeof AgentMessageChatLine> = {
  title: "Components/AgentMessageChatLine",
  component: AgentMessageChatLine,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
    },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="w-[800px] p-4 bg-gray-900">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AgentMessageChatLine>;

// Mock data that matches the schema
export const Default: Story = {
  args: {
    message: {
      messageType: "agent_message",
      content: {
        timestamp: Date.now(),
        roomId: 1,
        roundId: 1,
        senderId: 58, // This is the primary agent now
        originalMessages: [
          {
            agentId: 56,
            message: "Hello! This is a test message from an AI agent.",
          },
          {
            agentId: 57, // Additional message from another agent
            message: "And I'm joining in too!",
          },
        ],
        postPvpMessages: [],
        pvpStatusEffects: {},
      },
    },
    showSentiment: true,
  },
};

export const EmptyMessage: Story = {
  args: {
    message: {
      messageType: "agent_message",
      content: {
        timestamp: Date.now(),
        roomId: 1,
        roundId: 1,
        senderId: 58,
        originalMessages: [], // This will trigger the funny empty message
        postPvpMessages: [],
        pvpStatusEffects: {},
      },
    },
    showSentiment: true,
  },
};

// Add a story with multiple agents to test the bulk fetching
export const MultipleAgents: Story = {
  args: {
    message: {
      messageType: "agent_message",
      content: {
        timestamp: Date.now(),
        roomId: 1,
        roundId: 1,
        senderId: 58,
        originalMessages: [
          {
            agentId: 56,
            message: "We're all here together!",
          },
          {
            agentId: 57,
            message: "Indeed we are!",
          },
        ],
        postPvpMessages: [],
        pvpStatusEffects: {},
      },
    },
    showSentiment: true,
  },
};
