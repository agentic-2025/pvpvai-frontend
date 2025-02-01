import type { Meta, StoryObj } from "@storybook/react";
import { GMChatLine } from "./GMChatLine";

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
  tags: ["autodocs"],
} satisfies Meta<typeof GMChatLine>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: "Welcome to the game!",
  },
};

export const WithGavel: Story = {
  args: {
    message: "A new rule has been enacted.",
    showGavel: true,
  },
};

export const LongMessage: Story = {
  args: {
    message:
      "The game begins now... May the odds be ever in your favor. Remember to watch your back and trust no one completely.",
    showGavel: true,
  },
};
