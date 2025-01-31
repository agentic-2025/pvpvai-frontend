import type { Meta, StoryObj } from "@storybook/react";
import { BullBearRatioBar } from "./BullBearRatioBar";

const meta: Meta<typeof BullBearRatioBar> = {
  title: "Buy-Sell Game/BullBearRatioBar",
  component: BullBearRatioBar,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
    },
    docs: {
      description: {
        component:
          "A convenience wrapper around RatioBar that's prefilled with bear and bull configurations. Simply provide bearAmount and bullAmount to display their proportions.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[600px] p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BullBearRatioBar>;

export const RandomPercentage: Story = {
  args: {
    bearAmount: 60,
    bullAmount: 40,
  },
};

export const NoBearAmount: Story = {
  args: {
    bearAmount: 0,
    bullAmount: 100,
  },
};

export const NoAmounts: Story = {
  args: {
    bearAmount: 0,
    bullAmount: 0,
  },
};
