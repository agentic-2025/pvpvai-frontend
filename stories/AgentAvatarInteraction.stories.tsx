import type { Meta, StoryObj } from "@storybook/react";
import { AgentAvatarInteraction } from "./AgentAvatarInteraction";
import demoImage from "./assets/demo-personalities/godzilla.jpg";
import { Tables } from "@/lib/database.types";

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

// Mock room data for stories
const mockRoomData: Tables<"rooms"> = {
  id: 1,
  name: "Test Room",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  creator_id: 1,
  type_id: 1,
  chain_family: "evm",
  chain_id: 1,
  contract_address: "0x1234567890123456789012345678901234567890",
  image_url: "",
  color: "#FF0000",
  active: true,
  round_time: 300,
  game_master_id: 1,
  room_config: {},
  game_master_action_log: {},
  pvp_action_log: {},
  participants: 0,
};

const baseArgs = {
  name: "Agent Smith",
  borderColor: "#FF7B00",
  imageUrl: demoImage.src,
  betAmount: 0,
  agentAddress: "0x1234567890123456789012345678901234567890",
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

export const sellWithoutImage: Story = {
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
