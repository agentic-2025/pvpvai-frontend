import type { Meta, StoryObj } from "@storybook/react";
import { PvPActionChatLine } from "./PvPActionChatLine";

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
  tags: ["autodocs"],
} satisfies Meta<typeof PvPActionChatLine>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Attack: Story = {
  args: {
    action: "attack",
    instigator: "0x1234567890123456789012345678901234567890",
    targets: ["Player1", "Player2"],
    description: "Player1 received the following DM: You've been attacked!",
  },
};

export const Mute: Story = {
  args: {
    action: "mute",
    instigator: "0x1234567890123456789012345678901234567890",
    targets: ["Player3"],
    description: "Player3 will be unable to speak for 30 seconds",
    sentiment: "Negative",
    showSentiment: true,
  },
};

export const Deafen: Story = {
  args: {
    action: "deafen",
    instigator: "0x1234567890123456789012345678901234567890",
    targets: ["Player4"],
    description:
      "Player4 will be unable to receive messages from anyone but the GM for the next 30 seconds",
  },
};

export const Poison: Story = {
  args: {
    action: "poison",
    instigator: "0x1234567890123456789012345678901234567890",
    targets: ["Player5", "Player6"],
    description:
      "All messages from Player5 will have 'hello' changed to 'goodbye'",
  },
};
