import { generateMany, generateRoom } from "@/lib/generators";
import type { Meta, StoryObj } from "@storybook/react";
import type { RoomWithRelations } from "./RoomTable";
import { RoomTable } from "./RoomTable";

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

const rooms: RoomWithRelations[] = generateMany(generateRoom, 5).map(
  (room) => ({
    ...room,
    participants: 3,
    agents: [
      {
        id: 1,
        displayName: "Agent 1",
        image: null,
        color: "#FF0000",
      },
      {
        id: 2,
        displayName: "Agent 2",
        image: null,
        color: "#00FF00",
      },
    ],
    roundNumber: 1,
    agentMessages: [
      {
        agentId: 1,
        message: "Hello",
        createdAt: new Date().toISOString(),
        agentDetails: {
          id: 1,
          displayName: "Agent 1",
          image: null,
          color: "#FF0000",
        },
      },
    ],
  })
);

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
    roomType: "Buy / Hold / Sell",
    showTabs: false,
  },
};

export const PredictionMarketVariant: Story = {
  args: {
    rooms,
    roomType: "Long / Short",
    showTabs: false,
  },
};
