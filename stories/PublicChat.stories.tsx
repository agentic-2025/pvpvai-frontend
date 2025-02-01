import type { Meta, StoryObj } from "@storybook/react";
import { PublicChat } from "./PublicChat";

const MESSAGES = [
  {
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    avatarUrl: "https://github.com/shadcn.png",
    message: "Hey everyone! How's it going?",
    timestamp: new Date("2024-01-29T15:30:00"),
  },
  {
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    avatarUrl: "https://github.com/shadcn.png",
    message: "I've been working on the new feature",
    timestamp: new Date("2024-01-29T15:30:30"),
  },
  {
    address: "0x1234567890123456789012345678901234567890",
    message: "Just joined the chat! 👋",
    timestamp: new Date("2024-01-29T15:31:00"),
  },
  {
    address: "0x9876543210987654321098765432109876543210",
    message: "Welcome! Glad to have you here.",
    timestamp: new Date("2024-01-29T15:32:00"),
  },
  {
    address: "0x9876543210987654321098765432109876543210",
    message: "How's everyone doing today?",
    timestamp: new Date("2024-01-29T15:32:10"),
  },
  {
    address: "0xAbCdEf0123456789AbCdEf0123456789AbCdEf01",
    avatarUrl: "https://github.com/shadcn.png",
    message: "Has anyone started working on the new feature yet?",
    timestamp: new Date("2024-01-29T15:33:00"),
  },
];

const MESSAGES_WITH_AVATARS = MESSAGES.map((msg) => ({
  ...msg,
  avatarUrl:
    msg.address === "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
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
