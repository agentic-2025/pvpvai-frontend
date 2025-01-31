import type { Meta, StoryObj } from "@storybook/react";
import { BuySellGameAvatarInteraction } from "./BuySellGameAvatarInteraction";
import demoImage from "./assets/demo-personalities/godzilla.jpg";

const meta: Meta<typeof BuySellGameAvatarInteraction> = {
  title: "Buy-Sell Game/BuySellGameAvatarInteraction",
  component: BuySellGameAvatarInteraction,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[510px] p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BuySellGameAvatarInteraction>;

const baseArgs = {
  id: "agent1",
  name: "Agent Smith",
  borderColor: "#FF7B00",
  imageUrl: demoImage.src,
  betAmount: 0,
};

export const FullVariantRandomValues: Story = {
  args: {
    ...baseArgs,
    bearAmount: 60,
    bullAmount: 40,
    variant: "full",
  },
};

export const FullVariantWithoutName: Story = {
  args: {
    ...baseArgs,
    bearAmount: 60,
    bullAmount: 40,
    variant: "full",
    showName: false,
  },
};

export const SlimVariantRandomValues: Story = {
  args: {
    ...baseArgs,
    bearAmount: 60,
    bullAmount: 40,
    variant: "slim",
  },
};

export const SlimVariantWithoutName: Story = {
  args: {
    ...baseArgs,
    bearAmount: 60,
    bullAmount: 40,
    variant: "slim",
    showName: false,
  },
};

export const FullVariantNoBear: Story = {
  args: {
    ...baseArgs,
    bearAmount: 0,
    bullAmount: 100,
    variant: "full",
  },
};

export const SlimVariantNoBear: Story = {
  args: {
    ...baseArgs,
    bearAmount: 0,
    bullAmount: 100,
    variant: "slim",
  },
};

export const FullVariantNoBull: Story = {
  args: {
    ...baseArgs,
    bearAmount: 100,
    bullAmount: 0,
    variant: "full",
  },
};

export const SlimVariantNoBull: Story = {
  args: {
    ...baseArgs,
    bearAmount: 100,
    bullAmount: 0,
    variant: "slim",
  },
};

export const FullVariantNoAmounts: Story = {
  args: {
    ...baseArgs,
    bearAmount: 0,
    bullAmount: 0,
    variant: "full",
  },
};

export const SlimVariantNoAmounts: Story = {
  args: {
    ...baseArgs,
    bearAmount: 0,
    bullAmount: 0,
    variant: "slim",
  },
};

export const WithActiveBet: Story = {
  args: {
    ...baseArgs,
    bearAmount: 60,
    bullAmount: 40,
    betAmount: 100,
    betType: "Sell",
    variant: "full",
  },
};

export const WithActiveBetWithoutName: Story = {
  args: {
    ...baseArgs,
    bearAmount: 60,
    bullAmount: 40,
    betAmount: 100,
    betType: "Sell",
    variant: "full",
    showName: false,
  },
};
