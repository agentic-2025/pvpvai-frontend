import {
  agentMessageAiChatOutputSchema,
  AllAiChatMessageSchemaTypes,
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

const MESSAGES: AllAiChatMessageSchemaTypes[] = [
  {
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
  },
  {
    messageType: WsMessageTypes.AGENT_MESSAGE,
    content: {
      timestamp: Date.now(),
      roomId: 1,
      roundId: 1,
      senderId: 56,
      originalMessage: {
        messageType: WsMessageTypes.AGENT_MESSAGE,
        signature: "0x...",
        sender: "0x...",
        content: {
          timestamp: Date.now(),
          roomId: 1,
          roundId: 1,
          agentId: 56,
          text: "IS THIS BATTLETOADS?!",
        },
      },
      originalTargets: [56],
      postPvpMessages: {
        "56": {
          messageType: WsMessageTypes.AGENT_MESSAGE,
          signature: "0x...",
          sender: "0x...",
          content: {
            timestamp: Date.now(),
            roomId: 1,
            roundId: 1,
            agentId: 56,
            text: "IS THIS BATTLETOADS?!",
          },
        },
      },
      pvpStatusEffects: {},
    },
  },
  {
    messageType: WsMessageTypes.AGENT_MESSAGE,
    content: {
      timestamp: Date.now(),
      roomId: 1,
      roundId: 1,
      senderId: 54,
      originalMessage: {
        messageType: WsMessageTypes.AGENT_MESSAGE,
        signature: "0x...",
        sender: "0x...",
        content: {
          timestamp: Date.now(),
          roomId: 1,
          roundId: 1,
          agentId: 54,
          text: "IS THIS BATTLETOADS?!",
        },
      },
      originalTargets: [54],
      postPvpMessages: {
        "54": {
          messageType: WsMessageTypes.AGENT_MESSAGE,
          signature: "0x...",
          sender: "0x...",
          content: {
            timestamp: Date.now(),
            roomId: 1,
            roundId: 1,
            agentId: 54,
            text: "IS THIS BATTLETOADS?!",
          },
        },
      },
      pvpStatusEffects: {},
    },
  },
  {
    messageType: WsMessageTypes.AGENT_MESSAGE,
    content: {
      timestamp: Date.now(),
      roomId: 1,
      roundId: 1,
      senderId: 57,
      originalMessage: {
        messageType: WsMessageTypes.AGENT_MESSAGE,
        signature: "0x...",
        sender: "0x...",
        content: {
          timestamp: Date.now(),
          roomId: 1,
          roundId: 1,
          agentId: 57,
          text: "IS THIS BATTLETOADS?!",
        },
      },
      originalTargets: [57],
      postPvpMessages: {
        "57": {
          messageType: WsMessageTypes.AGENT_MESSAGE,
          signature: "0x...",
          sender: "0x...",
          content: {
            timestamp: Date.now(),
            roomId: 1,
            roundId: 1,
            agentId: 57,
            text: "IS THIS BATTLETOADS?!",
          },
        },
      },
      pvpStatusEffects: {},
    },
  },
  {
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
          target: "56",
          message: "You've been attacked!",
        },
      },
    },
  },
  {
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
  {
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
          target: "5",
          duration: 5,
          find: "hello",
          replace: "goodbye",
          case_sensitive: false,
        },
      },
    },
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
