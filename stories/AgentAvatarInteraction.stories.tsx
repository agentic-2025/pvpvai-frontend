import type { Meta, StoryObj } from "@storybook/react";
import { AgentAvatarInteraction } from "./AgentAvatarInteraction";
import demoImage from "./assets/demo-personalities/godzilla.jpg";

const meta = {
  title: "Buy-Sell Game/AgentAvatarInteraction",
  component: AgentAvatarInteraction,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AgentAvatarInteraction>;

export default meta;
type Story = StoryObj<typeof meta>;

console.log(demoImage);
console.log("HERE");
console.log(demoImage.toString());

const baseArgs = {
  name: "Agent Smith",
  borderColor: "#FF7B00",
  imageUrl: demoImage.src,
  betAmount: 0,
};

export const WithImage: Story = {
  args: baseArgs,
};

export const WithoutImage: Story = {
  args: {
    ...baseArgs,
    imageUrl: undefined,
  },
};

export const SellOverlay: Story = {
  args: {
    ...baseArgs,
    betAmount: 100,
    betType: "Sell",
  },
};

export const SellWithoutImage: Story = {
  args: {
    ...baseArgs,
    imageUrl: undefined,
    betAmount: 100,
    betType: "Sell",
  },
};

export const BuyOverlay: Story = {
  args: {
    ...baseArgs,
    betAmount: 3,
    betType: "Buy",
  },
};

export const BuyWithoutImage: Story = {
  args: {
    ...baseArgs,
    imageUrl: undefined,
    betAmount: 3,
    betType: "Buy",
  },
};
