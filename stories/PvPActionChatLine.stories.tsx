import {
  pvpActionEnactedAiChatOutputSchema,
  WsMessageTypes,
} from "@/lib/backend.types";
import { PvpActionCategories, PvpActions } from "@/lib/pvp.types";
import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { z } from "zod";
import { PvPActionChatLine } from "./PvPActionChatLine";

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

const meta = {
  title: "Components/PvPActionChatLine",
  component: PvPActionChatLine,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
    },
    themes: {
      default: "dark",
    },
  },
  decorators: [
    (Story) => (
      <QueryWrapper>
        <Story />
      </QueryWrapper>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof PvPActionChatLine>;

export default meta;
type Story = StoryObj<typeof meta>;

// Create a properly typed base message
const baseMessage: z.infer<typeof pvpActionEnactedAiChatOutputSchema> = {
  messageType: WsMessageTypes.PVP_ACTION_ENACTED,
  signature: "0xsignature",
  sender: "0xsender",
  content: {
    timestamp: Date.now(),
    roomId: 1,
    roundId: 1,
    instigator: 48,
    instigatorAddress: "0x1234567890123456789012345678901234567890",
    txHash: "0xtxhash",
    fee: 0.001,
    action: {
      actionType: PvpActions.ATTACK, // Default action, will be overridden in stories
      actionCategory: PvpActionCategories.DIRECT_ACTION,
      parameters: {
        target: 49,
        message: "message wow", // Will be overridden in stories
      },
    },
  },
};

export const Attack: Story = {
  args: {
    message: {
      ...baseMessage,
      content: {
        ...baseMessage.content,
        action: {
          actionType: PvpActions.ATTACK,
          actionCategory: PvpActionCategories.DIRECT_ACTION,
          parameters: {
            target: 49,
            message: "You've been attacked!",
          },
        },
      },
    },
  },
};

export const Silence: Story = {
  args: {
    message: {
      ...baseMessage,
      content: {
        ...baseMessage.content,
        action: {
          actionType: PvpActions.SILENCE,
          parameters: {
            target: 50,
            duration: 30,
          },
        },
      },
    } as z.infer<typeof pvpActionEnactedAiChatOutputSchema>,
  },
};

export const Deafen: Story = {
  args: {
    message: {
      ...baseMessage,
      content: {
        ...baseMessage.content,
        action: {
          actionType: PvpActions.DEAFEN,
          actionCategory: PvpActionCategories.STATUS_EFFECT,
          parameters: {
            target: 51,
            duration: 30,
          },
        },
      },
    } as z.infer<typeof pvpActionEnactedAiChatOutputSchema>,
  },
};

export const Poison: Story = {
  args: {
    message: {
      ...baseMessage,
      content: {
        ...baseMessage.content,
        action: {
          actionType: PvpActions.POISON,
          parameters: {
            target: 52,
            find: "hello",
            replace: "goodbye",
            duration: 30,
            case_sensitive: false,
          },
        },
      },
    } as z.infer<typeof pvpActionEnactedAiChatOutputSchema>,
  },
};
