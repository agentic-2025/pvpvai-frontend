import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { ObservationChatLine } from "./ObservationChatLine";
import { ObservationType } from "@/lib/backend.types";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
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
  title: "Components/ObservationChatLine",
  component: ObservationChatLine,
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
} satisfies Meta<typeof ObservationChatLine>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockObservationMessage = {
  messageType: "observation" as const,
  signature: "mock_signature",
  sender: "mock_sender",
  content: {
    agentId: 1,
    timestamp: Date.now(),
    roomId: 1,
    roundId: 1,
    observationType: ObservationType.WALLET_BALANCES,
    data: {
      // Mock data object
      balances: {
        eth: "1.5",
        usdc: "1000",
      },
    },
  },
};

export const Default: Story = {
  args: {
    message: mockObservationMessage,
  },
};

export const PriceData: Story = {
  args: {
    message: {
      ...mockObservationMessage,
      content: {
        ...mockObservationMessage.content,
        observationType: ObservationType.PRICE_DATA,
      },
    },
  },
};

export const GameEvent: Story = {
  args: {
    message: {
      ...mockObservationMessage,
      content: {
        ...mockObservationMessage.content,
        observationType: ObservationType.GAME_EVENT,
      },
    },
  },
}; 