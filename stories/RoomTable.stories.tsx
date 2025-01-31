import type { Meta, StoryObj } from "@storybook/react";
import { RoomTable } from "./RoomTable";
import { generateMany, generateRoom } from "@/lib/generators";

const meta = {
  title: "Components/RoomTable",
  component: RoomTable,
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
      <div className="dark">
        <div className="bg-background min-h-screen p-8 w-[1200px]">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof RoomTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const rooms = generateMany(generateRoom, 5);

export const Default: Story = {
  args: {
    rooms,
    showTabs: false,
  },
};

export const WithVariantControl: Story = {
  args: {
    rooms,
    showTabs: true,
  },
};

export const BuySellVariant: Story = {
  args: {
    rooms,
    roomType: "Buy Sell",
    showTabs: false,
  },
};

export const PredictionMarketVariant: Story = {
  args: {
    rooms,
    roomType: "Prediction Market",
    showTabs: false,
  },
};
