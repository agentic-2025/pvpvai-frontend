import {
  agentMessageAiChatOutputSchema,
  gmMessageAiChatOutputSchema,
  pvpActionEnactedAiChatOutputSchema,
  WsMessageTypes,
} from "@/lib/backend.types";
import { Tables } from "@/lib/database.types";
import { PvpActionCategories, PvpActions } from "@/lib/pvp.types";
import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { z } from "zod";
import { AgentChat } from "./AgentChat";
import gm from "./assets/gm.png";
import gavel from "./assets/pvp/gavel.svg";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // For Storybook, disable retries and keep cache for longer
      retry: false,
      staleTime: Infinity,
      gcTime: Infinity,
    },
  },
});

// Create a wrapper component
const QueryWrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const demoAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
const timestamp = new Date().toISOString();

const MESSAGES: Tables<"round_agent_messages">[] = [
  {
    id: 1,
    agent_id: 58,
    round_id: 1,
    created_at: timestamp,
    updated_at: timestamp,
    message: {
      messageType: WsMessageTypes.GM_MESSAGE,
      signature: "0x...",
      sender: "0x0",
      content: {
        gmId: 58,
        timestamp: Date.now(),
        targets: [54, 56, 57],
        roomId: 1,
        roundId: 1,
        message: "Welcome to the game! Let the mayhem begin...",
        additionalData: {
          agentName: "Mama (GM)",
          agentImageUrl: gm.src,
          agentBorderColor: "#D4AF37",
        },
        ignoreErrors: false,
      },
    } satisfies z.infer<typeof gmMessageAiChatOutputSchema>,
    message_type: WsMessageTypes.GM_MESSAGE,
    original_author: null,
    pvp_status_effects: null,
  },
  {
    id: 2,
    agent_id: 56,
    round_id: 1,
    created_at: timestamp,
    updated_at: timestamp,
    message: {
      messageType: WsMessageTypes.AGENT_MESSAGE,
      content: {
        timestamp: Date.now(),
        roomId: 1,
        roundId: 1,
        senderId: 56,
        originalMessages: [
          {
            agentId: 48,
            message:
              "Hello! I'm Claude, an AI assistant. How can I help you today?",
          },
        ],
        postPvpMessages: [
          {
            agentId: 48,
            message:
              "Hello! I'm AI assistant, an Claude. Today how can I help you?",
          },
          {
            agentId: 56,
            message: "IS THIS BATTLETOADS?!",
          },
        ],
        pvpStatusEffects: {},
        // additionalData: {
        //   agentName: "Claude",
        //   agentImageUrl:
        //     "https://storage.googleapis.com/anthropic-website/photos/claude-profile.jpg",
        //   agentBorderColor: "#7C3AED",
        //   sentiment: "Friendly",
        //   additionalIcons: [claudeIcon.src],
        // },
      },
    } satisfies z.infer<typeof agentMessageAiChatOutputSchema>,
    message_type: WsMessageTypes.AGENT_MESSAGE,
    original_author: 2,
    pvp_status_effects: {},
  },
  {
    id: 2,
    agent_id: 54,
    round_id: 1,
    created_at: timestamp,
    updated_at: timestamp,
    message: {
      messageType: WsMessageTypes.AGENT_MESSAGE,
      content: {
        timestamp: Date.now(),
        roomId: 1,
        roundId: 1,
        senderId: 54,
        originalMessages: [
          {
            agentId: 48,
            message:
              "Hello! I'm Claude, an AI assistant. How can I help you today?",
          },
        ],
        postPvpMessages: [
          {
            agentId: 48,
            message:
              "Hello! I'm AI assistant, an Claude. Today how can I help you?",
          },
          {
            agentId: 56,
            message: "IS THIS BATTLETOADS?!",
          },
        ],
        pvpStatusEffects: {},
        // additionalData: {
        //   agentName: "Claude",
        //   agentImageUrl:
        //     "https://storage.googleapis.com/anthropic-website/photos/claude-profile.jpg",
        //   agentBorderColor: "#7C3AED",
        //   sentiment: "Friendly",
        //   additionalIcons: [claudeIcon.src],
        // },
      },
    } satisfies z.infer<typeof agentMessageAiChatOutputSchema>,
    message_type: WsMessageTypes.AGENT_MESSAGE,
    original_author: 54,
    pvp_status_effects: {},
  },
  {
    id: 2,
    agent_id: 57,
    round_id: 1,
    created_at: timestamp,
    updated_at: timestamp,
    message: {
      messageType: WsMessageTypes.AGENT_MESSAGE,
      content: {
        timestamp: Date.now(),
        roomId: 1,
        roundId: 1,
        senderId: 57,
        originalMessages: [
          {
            agentId: 48,
            message:
              "Hello! I'm Claude, an AI assistant. How can I help you today?",
          },
        ],
        postPvpMessages: [
          {
            agentId: 48,
            message:
              "Hello! I'm AI assistant, an Claude. Today how can I help you?",
          },
          {
            agentId: 56,
            message: "IS THIS BATTLETOADS?!",
          },
        ],
        pvpStatusEffects: {},
        // additionalData: {
        //   agentName: "Claude",
        //   agentImageUrl:
        //     "https://storage.googleapis.com/anthropic-website/photos/claude-profile.jpg",
        //   agentBorderColor: "#7C3AED",
        //   sentiment: "Friendly",
        //   additionalIcons: [claudeIcon.src],
        // },
      },
    } satisfies z.infer<typeof agentMessageAiChatOutputSchema>,
    message_type: WsMessageTypes.AGENT_MESSAGE,
    original_author: 57,
    pvp_status_effects: {},
  },
  {
    id: 3,
    agent_id: 57,
    round_id: 1,
    created_at: timestamp,
    updated_at: timestamp,
    message: {
      messageType: WsMessageTypes.PVP_ACTION_ENACTED,
      signature: "0x...",
      sender: demoAddress,
      content: {
        timestamp: Date.now(),
        roomId: 1,
        roundId: 1,
        instigator: 1,
        instigatorAddress: demoAddress,
        txHash: "0x...",
        fee: 0.1,
        action: {
          actionType: PvpActions.ATTACK,
          actionCategory: PvpActionCategories.DIRECT_ACTION,
          parameters: {
            target: 56,
            message: "You've been attacked!",
          },
        },
      },
    } satisfies z.infer<typeof pvpActionEnactedAiChatOutputSchema>,
    message_type: WsMessageTypes.PVP_ACTION_ENACTED,
    original_author: null,
    pvp_status_effects: null,
  },
  {
    id: 4,
    agent_id: 57,
    round_id: 1,
    created_at: timestamp,
    updated_at: timestamp,
    message: {
      messageType: WsMessageTypes.GM_MESSAGE,
      signature: "0x...",
      sender: "0x0",
      content: {
        gmId: 1,
        timestamp: Date.now(),
        targets: [1, 2, 3],
        roomId: 1,
        roundId: 1,
        message: "A new rule has been enacted: No talking about Bruno!",
        additionalData: {
          agentName: "Mama (GM)",
          agentImageUrl: gm.src,
          agentBorderColor: "#D4AF37",
          additionalIcons: [gavel.src],
        },
      },
    },
    message_type: WsMessageTypes.GM_MESSAGE,
    original_author: null,
    pvp_status_effects: null,
  },
  {
    id: 5,
    agent_id: 54,
    round_id: 1,
    created_at: timestamp,
    updated_at: timestamp,
    message: {
      messageType: WsMessageTypes.PVP_ACTION_ENACTED,
      signature: "0x...",
      sender: demoAddress,
      content: {
        timestamp: Date.now(),
        roomId: 1,
        roundId: 1,
        instigator: 1,
        instigatorAddress: demoAddress,
        txHash: "0x...",
        fee: 0.1,
        action: {
          actionType: PvpActions.POISON,
          actionCategory: PvpActionCategories.STATUS_EFFECT,
          parameters: {
            target: 5,
            duration: 5,
            find: "hello",
            replace: "goodbye",
            case_sensitive: false,
          },
        },
      },
    } satisfies z.infer<typeof pvpActionEnactedAiChatOutputSchema>,
    message_type: WsMessageTypes.PVP_ACTION_ENACTED,
    original_author: null,
    pvp_status_effects: null,
  },
];

const meta: Meta<typeof AgentChat> = {
  title: "Components/AgentChat",
  component: AgentChat,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
    },
  },
  decorators: [
    (Story) => (
      <QueryWrapper>
        <div className="w-[800px] h-[600px] p-4 bg-gray-900">
          <Story />
        </div>
      </QueryWrapper>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AgentChat>;

export const Default: Story = {
  args: {
    messages: MESSAGES,
  },
};

export const NoHeader: Story = {
  args: {
    messages: MESSAGES,
    showHeader: false,
  },
};

export const NoSentiment: Story = {
  args: {
    messages: MESSAGES,
  },
};

export const Empty: Story = {
  args: {
    messages: [],
  },
};

export const SingleMessage: Story = {
  args: {
    messages: [MESSAGES[0]],
  },
};

export const LongConversation: Story = {
  args: {
    messages: Array(20)
      .fill(null)
      .map((_, index) => ({
        ...MESSAGES[index % MESSAGES.length],
      })),
  },
};
