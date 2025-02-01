import type { Meta, StoryObj } from "@storybook/react";
import { NetworkButton } from "./NetworkButton";
import arbitrumIcon from "./assets/crypto/arbitrum-full-primary.svg";
import baseIcon from "./assets/crypto/base-full-white.svg";
import flowIcon from "./assets/crypto/flow-full-white.svg";
import solanaIcon from "./assets/crypto/solana-full-color.svg";

const meta = {
  title: "Components/NetworkButton",
  component: NetworkButton,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof NetworkButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Solana - Purple theme
export const Solana: Story = {
  args: {
    iconUrl: solanaIcon.src,
    className: "bg-[#512DA8] w-[200px] h-[60px]",
    iconClassName: "w-[160px] h-[40px]",
  },
};

export const SolanaSelected: Story = {
  args: {
    ...Solana.args,
    selected: true,
  },
};

// Base - Blue theme
export const Base: Story = {
  args: {
    iconUrl: baseIcon.src,
    className: "bg-[#0052FF] w-[200px] h-[60px]",
    iconClassName: "w-[160px] h-[40px]",
  },
};

export const BaseSelected: Story = {
  args: {
    ...Base.args,
    selected: true,
  },
};

// Arbitrum - White theme
export const Arbitrum: Story = {
  args: {
    iconUrl: arbitrumIcon.src,
    className: "bg-white w-[200px] h-[60px]",
    iconClassName: "w-[160px] h-[40px]",
  },
};

export const ArbitrumSelected: Story = {
  args: {
    ...Arbitrum.args,
    selected: true,
  },
};

// Flow - Green theme
// Alt color: #02D87E
export const Flow: Story = {
  args: {
    iconUrl: flowIcon.src,
    className: "bg-[#00EF8B] w-[200px] h-[60px]",
    iconClassName: "w-[160px] h-[40px]",
  },
};

export const FlowSelected: Story = {
  args: {
    ...Flow.args,
    selected: true,
  },
};

// Example with custom dimensions
export const CustomSize: Story = {
  args: {
    iconUrl: solanaIcon.src,
    className: "bg-[#9945FF] w-[300px] h-[80px]",
    iconClassName: "w-[240px] h-[60px]",
  },
};
