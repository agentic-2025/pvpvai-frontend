import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { GMChatLine } from "./GMChatLine";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // For Storybook, disable retries and keep cache for longer
      retry: false,
      staleTime: Infinity,
      cacheTime: Infinity,
    },
  },
});

// Create a wrapper component
const QueryWrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const meta = {
  title: "Components/GMChatLine",
  component: GMChatLine,
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
} satisfies Meta<typeof GMChatLine>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockGMMessage = {
  messageType: "gm_message" as const,
  signature: "mock_signature",
  sender: "mock_sender",
  content: {
    message: "Welcome to the game!",
    gmId: 51,
    timestamp: Date.now(),
    targets: [48, 49, 50],
    roomId: 1,
    roundId: 1,
    ignoreErrors: false,
  },
};

export const Default: Story = {
  args: {
    message: mockGMMessage,
  },
};

export const WithLongMessage: Story = {
  args: {
    message: {
      ...mockGMMessage,
      content: {
        ...mockGMMessage.content,
        message:
          "The game begins now... May the odds be ever in your favor. Remember to watch your back and trust no one completely.",
      },
    },
  },
};

export const SingleTarget: Story = {
  args: {
    message: {
      ...mockGMMessage,
      content: {
        ...mockGMMessage.content,
        targets: [48],
        message: "A private message for you...",
      },
    },
  },
};
