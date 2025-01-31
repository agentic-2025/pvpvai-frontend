import type { Meta, StoryObj } from "@storybook/react";
import { RatioBar } from "./RatioBar";
import usdcIcon from "./assets/crypto/usdc.svg";
import usdtIcon from "./assets/crypto/usdt.svg";
import solanaIcon from "./assets/crypto/solana-color.svg";
import arbitrumIcon from "./assets/crypto/arbitrum.svg";
import a16zIcon from "./assets/crypto/ai16z.png";

const ITEMS = {
  USDC: {
    label: "USDC",
    amount: 1000,
    color: "#2775CA",
    iconUrl: usdcIcon.src,
  },
  USDT: {
    label: "USDT",
    amount: 800,
    color: "#26A17B",
    iconUrl: usdtIcon.src,
  },
  SOLANA: {
    label: "Solana",
    amount: 500,
    color: "#9945FF",
    iconUrl: solanaIcon.src,
  },
  ARBITRUM: {
    label: "Arbitrum",
    amount: 300,
    color: "#28A0F0",
    iconUrl: arbitrumIcon.src,
  },
  A16Z: {
    label: "a16z",
    amount: 200,
    color: "#FF7324",
    iconUrl: a16zIcon.src,
  },
};

const meta: Meta<typeof RatioBar> = {
  title: "Components/RatioBar",
  component: RatioBar,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
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
type Story = StoryObj<typeof RatioBar>;

export const TwoElements: Story = {
  args: {
    items: [ITEMS.USDC, ITEMS.USDT],
  },
};

export const ThreeElements: Story = {
  args: {
    items: [ITEMS.SOLANA, ITEMS.ARBITRUM, ITEMS.A16Z],
  },
};

export const FiveElements: Story = {
  args: {
    items: [ITEMS.USDC, ITEMS.USDT, ITEMS.SOLANA, ITEMS.ARBITRUM, ITEMS.A16Z],
  },
};

export const SmallAmount: Story = {
  args: {
    items: [
      { ...ITEMS.USDC, amount: 10000 },
      { ...ITEMS.USDT, amount: 8000 },
      { ...ITEMS.SOLANA, amount: 5000 },
      { ...ITEMS.ARBITRUM, amount: 3000 },
      { ...ITEMS.A16Z, amount: 1 },
    ],
  },
};

export const NoAmounts: Story = {
  args: {
    items: [],
  },
};

export const ZeroAmounts: Story = {
  args: {
    items: [
      { ...ITEMS.USDC, amount: 0 },
      { ...ITEMS.USDT, amount: 0 },
    ],
  },
};

export const MissingIcons: Story = {
  args: {
    items: [
      { ...ITEMS.USDC, iconUrl: undefined },
      ITEMS.USDT,
      { ...ITEMS.SOLANA, iconUrl: "/non-existent-icon.svg" },
      ITEMS.ARBITRUM,
      { ...ITEMS.A16Z, iconUrl: undefined },
    ],
  },
};

export const SmallContainer: Story = {
  decorators: [
    (Story) => (
      <div className="w-[200px] p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    items: [ITEMS.USDC, ITEMS.USDT],
  },
};

export const LargeContainer: Story = {
  decorators: [
    (Story) => (
      <div className="w-[1000px] p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    items: [ITEMS.USDC, ITEMS.USDT],
  },
};
