import type { Meta, StoryObj } from "@storybook/react";
import { PlayerAddressChip } from "./PlayerAddressChip";

const meta = {
  title: "Components/PlayerAddressChip",
  component: PlayerAddressChip,
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
} satisfies Meta<typeof PlayerAddressChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    address: "0x1234567890123456789012345678901234567890",
  },
};

export const WithAvatar: Story = {
  args: {
    address: "0x1234567890123456789012345678901234567890",
    showAvatar: true,
  },
};

export const Small: Story = {
  args: {
    address: "0x1234567890123456789012345678901234567890",
    showAvatar: true,
    variant: "small",
  },
};

export const Large: Story = {
  args: {
    address: "0x1234567890123456789012345678901234567890",
    showAvatar: true,
    variant: "large",
  },
};

export const WithCustomAvatar: Story = {
  args: {
    address: "0x1234567890123456789012345678901234567890",
    showAvatar: true,
    avatarImageUrl: "/placeholder.png",
  },
};
