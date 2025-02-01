import type { Meta, StoryObj } from "@storybook/react";
import { PublicChatLine } from "./PublicChatLine";

const meta = {
  title: "Components/PublicChatLine",
  component: PublicChatLine,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
    },
  },
  decorators: [
    (Story, { parameters }) => (
      <div
        className={`w-[${parameters?.containerWidth || "800px"}] bg-[#313338]`}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PublicChatLine>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithCustomAvatar: Story = {
  args: {
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    avatarUrl: "https://github.com/shadcn.png",
    message: "Hey everyone! How's it going?",
    timestamp: new Date("2024-01-29T15:30:00"),
    variant: "default",
  },
};

export const WithJazziconAvatar: Story = {
  args: {
    address: "0x1234567890123456789012345678901234567890",
    message: "Just joined the chat! 👋",
    timestamp: new Date("2024-01-29T15:31:00"),
    variant: "default",
  },
};

export const CompactWithCustomAvatar: Story = {
  args: {
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    avatarUrl: "https://github.com/shadcn.png",
    message: "Hey everyone! How's it going?",
    timestamp: new Date("2024-01-29T15:30:00"),
    variant: "compact",
  },
};

export const CompactWithJazziconAvatar: Story = {
  args: {
    address: "0x1234567890123456789012345678901234567890",
    message: "This is a follow-up message",
    timestamp: new Date("2024-01-29T15:31:00"),
    variant: "compact",
  },
};

export const NarrowContainer: Story = {
  args: {
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    message:
      "This message is displayed in a narrow container to show how the text wraps and the layout adjusts to a constrained space.",
    timestamp: new Date("2024-01-29T15:30:00"),
    variant: "compact",
  },
  parameters: {
    containerWidth: "400px",
  },
};

export const NarrowContainerDefault: Story = {
  args: {
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    message:
      "This message is displayed in a narrow container to show how the text wraps and the layout adjusts to a constrained space.",
    timestamp: new Date("2024-01-29T15:30:00"),
    variant: "default",
  },
  parameters: {
    containerWidth: "400px",
  },
};

export const LongMessage: Story = {
  args: {
    address: "0x9876543210987654321098765432109876543210",
    message:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    timestamp: new Date("2024-01-29T15:32:00"),
  },
};
