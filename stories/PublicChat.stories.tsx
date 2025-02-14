import type { Meta, StoryObj } from "@storybook/react";
import { PublicChat } from "./PublicChat";
import { WsMessageTypes } from "@/lib/backend.types";

// Define the message type to match what the component expects
type ChatMessage = {
  messageType: WsMessageTypes.PUBLIC_CHAT;
  signature: string;
  sender: string;
  content: {
    timestamp: number;
    roomId: number;
    roundId: number;
    text: string;
  };
  avatarUrl?: string;
};

const MESSAGES: ChatMessage[] = [
  {
    messageType: WsMessageTypes.PUBLIC_CHAT,
    signature: "0x123...", // Mock signature
    sender: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    content: {
      timestamp: new Date("2024-01-29T15:30:00").getTime(),
      roomId: 1,
      roundId: 1,
      text: "Hey everyone! How's it going?",
    },
  },
  {
    messageType: WsMessageTypes.PUBLIC_CHAT,
    signature: "0x124...", // Mock signature
    sender: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    content: {
      timestamp: new Date("2024-01-29T15:30:30").getTime(),
      roomId: 1,
      roundId: 1,
      text: "I've been working on the new feature",
    },
  },
  {
    messageType: WsMessageTypes.PUBLIC_CHAT,
    signature: "0x125...", // Mock signature
    sender: "0x1234567890123456789012345678901234567890",
    content: {
      timestamp: new Date("2024-01-29T15:31:00").getTime(),
      roomId: 1,
      roundId: 1,
      text: "Just joined the chat! 👋",
    },
  },
  {
    messageType: WsMessageTypes.PUBLIC_CHAT,
    signature: "0x126...", // Mock signature
    sender: "0x9876543210987654321098765432109876543210",
    content: {
      timestamp: new Date("2024-01-29T15:32:00").getTime(),
      roomId: 1,
      roundId: 1,
      text: "Welcome! Glad to have you here.",
    },
  },
  {
    messageType: WsMessageTypes.PUBLIC_CHAT,
    signature: "0x127...", // Mock signature
    sender: "0x9876543210987654321098765432109876543210",
    content: {
      timestamp: new Date("2024-01-29T15:32:10").getTime(),
      roomId: 1,
      roundId: 1,
      text: "How's everyone doing today?",
    },
  },
  {
    messageType: WsMessageTypes.PUBLIC_CHAT,
    signature: "0x128...", // Mock signature
    sender: "0xAbCdEf0123456789AbCdEf0123456789AbCdEf01",
    content: {
      timestamp: new Date("2024-01-29T15:33:00").getTime(),
      roomId: 1,
      roundId: 1,
      text: "Has anyone started working on the new feature yet?",
    },
  },
];

const MESSAGES_WITH_AVATARS: ChatMessage[] = MESSAGES.map((msg) => ({
  ...msg,
  avatarUrl:
    msg.sender === "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
      ? "https://github.com/shadcn.png"
      : undefined,
}));

const meta = {
  title: "Components/PublicChat",
  component: PublicChat,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[800px] h-[600px] bg-[#313338]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PublicChat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    messages: MESSAGES_WITH_AVATARS,
    currentUserAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    onSendMessage: (message: string) =>
      console.log("Sending message:", message),
  },
};

export const Compact: Story = {
  args: {
    messages: MESSAGES_WITH_AVATARS,
    currentUserAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    onSendMessage: (message: string) =>
      console.log("Sending message:", message),
    variant: "compact",
  },
};

export const ViewOnly: Story = {
  args: {
    messages: MESSAGES_WITH_AVATARS,
  },
};
