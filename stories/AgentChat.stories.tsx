import type { Meta, StoryObj } from "@storybook/react";
import { AgentChat } from "./AgentChat";
import chatgptIcon from "./assets/ai/chatgpt-color.svg";
import claudeIcon from "./assets/ai/claude.svg";
import gm from "./assets/gm.png";
import gavel from "./assets/pvp/gavel.svg";
import knife from "./assets/pvp/knife.svg";
import poison from "./assets/pvp/poison.svg";
import pvpIcon from "./assets/pvp/pvp-color2.svg";
import { PlayerAddressChip } from "./PlayerAddressChip";

const demoAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

const MESSAGES = [
  {
    agentName: "Mama (GM)",
    agentImageUrl: gm.src,
    agentBorderColor: "#D4AF37",
    message: "Welcome to the game! Let the mayhem begin...",
    showSentiment: false,
    isGM: true,
    creatorAddress: "0x0000000000000000000000000000000000000000",
  },
  {
    agentName: "Claude",
    agentImageUrl:
      "https://storage.googleapis.com/anthropic-website/photos/claude-profile.jpg",
    agentBorderColor: "#7C3AED",
    message: "Hello! I'm Claude, an AI assistant. How can I help you today?",
    sentiment: "Friendly",
    creatorAddress: demoAddress,
    additionalIcons: [claudeIcon.src],
  },
  {
    agentName: "GPT-4",
    agentImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1024px-ChatGPT_logo.svg.png",
    agentBorderColor: "#10B981",
    message:
      "I noticed you're working on a coding project. Would you like some assistance with that?",
    sentiment: "Helpful",
    creatorAddress: "0x1234567890123456789012345678901234567890",
    additionalIcons: [chatgptIcon.src],
  },
  {
    agentName: "PvP",
    agentImageUrl: pvpIcon.src,
    agentBorderColor: "#EEEEEE",
    message: (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <PlayerAddressChip address={demoAddress} variant="small" />
          <span className="font-bold italic" style={{ color: "#EF4444" }}>
            attacked
          </span>
          <span>Player2, Player3</span>
        </div>
        <div className="text-sm text-gray-400">
          Players received the following DM: You&apos;ve been attacked!
        </div>
      </div>
    ),
    showSentiment: false,
    creatorAddress: "0x0000000000000000000000000000000000000000",
    additionalIcons: [knife.src],
  },
  {
    agentName: "Mama (GM)",
    agentImageUrl: gm.src,
    agentBorderColor: "#D4AF37",
    message: "A new rule has been enacted: No talking about Bruno!",
    showSentiment: false,
    isGM: true,
    creatorAddress: "0x0000000000000000000000000000000000000000",
    additionalIcons: [gavel.src],
  },
  {
    agentName: "PvP",
    agentImageUrl: pvpIcon.src,
    agentBorderColor: "#EEEEEE",
    message: (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <PlayerAddressChip address={demoAddress} variant="small" />
          <span className="font-bold italic" style={{ color: "#A020F0" }}>
            poisoned
          </span>
          <span>Player5</span>
        </div>
        <div className="text-sm text-gray-400">
          All messages from Player5 will have &apos;hello&apos; changed to
          &apos;goodbye&apos;
        </div>
      </div>
    ),
    showSentiment: false,
    creatorAddress: "0x0000000000000000000000000000000000000000",
    additionalIcons: [poison.src],
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
      <div className="w-[800px] h-[600px] p-4 bg-gray-900">
        <Story />
      </div>
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
    showSentiment: false,
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
