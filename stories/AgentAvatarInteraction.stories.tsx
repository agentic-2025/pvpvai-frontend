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

// Mock room data that matches Tables<"rooms"> structure
const mockRoomData = {
  id: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  active: true,
  name: "Test Room",
  description: "Test Description",
  image_url: "",
  entry_amount: 1,
  min_players: 2,
  max_players: 10,
  start_time: new Date().toISOString(),
  end_time: new Date().toISOString(),
  status: "active",
  winner_id: null,
  prize_pool: 0,
  game_type: "standard",
  creator_id: "test-creator",
  current_price: 0,
  initial_price: 0,
  price_history: [],
  room_type: "public",
} as const;

const baseArgs = {
  name: "Agent Smith",
  borderColor: "#FF7B00",
  imageUrl: demoImage.src,
  betAmount: 0,
  agentAddress: "0x123...789",
  roomData: mockRoomData,
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
    betType: "sell",
  },
};

export const SellWithoutImage: Story = {
  args: {
    ...baseArgs,
    imageUrl: undefined,
    betAmount: 100,
    betType: "sell",
  },
};

export const BuyOverlay: Story = {
  args: {
    ...baseArgs,
    betAmount: 3,
    betType: "buy",
  },
};

export const BuyWithoutImage: Story = {
  args: {
    ...baseArgs,
    imageUrl: undefined,
    betAmount: 3,
    betType: "buy",
  },
};
