import type { Meta, StoryObj } from "@storybook/react";
import { ExternalDataChatLine } from "./ExternalDataChatLine";

const meta = {
  title: "Components/ExternalDataChatLine",
  component: ExternalDataChatLine,
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
} satisfies Meta<typeof ExternalDataChatLine>;

export default meta;
type Story = StoryObj<typeof meta>;

export const News: Story = {
  args: {
    dataType: "news",
    message:
      "Bitcoin reaches new all-time high as institutional adoption grows.",
  },
};

export const NewsWithReactNode: Story = {
  args: {
    dataType: "news",
    message: (
      <div className="flex flex-col gap-2">
        <span className="font-bold">Breaking News:</span>
        <span>
          Bitcoin reaches new all-time high as institutional adoption grows.
        </span>
      </div>
    ),
  },
};

export const SocialMedia: Story = {
  args: {
    dataType: "social-media",
    message: "Top trending crypto discussions on r/CryptoCurrency this week.",
  },
};

export const WalletBalancesDefault: Story = {
  args: {
    dataType: "wallet-balances",
    message: "Player1: 100 ETH\nPlayer2: 50 ETH\nPlayer3: 75 ETH",
  },
};

export const WalletBalancesCoinbase: Story = {
  args: {
    dataType: "wallet-balances",
    message: (
      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <span>Player1:</span>
          <span className="font-mono">100 ETH</span>
        </div>
        <div className="flex justify-between">
          <span>Player2:</span>
          <span className="font-mono">50 ETH</span>
        </div>
        <div className="flex justify-between">
          <span>Player3:</span>
          <span className="font-mono">75 ETH</span>
        </div>
      </div>
    ),
    dataSource: "coinbase-sdk",
  },
};

export const PriceDataDefault: Story = {
  args: {
    dataType: "price-data",
    message: "ETH/USD: $2,500\nBTC/USD: $45,000",
  },
};

export const PriceDataPyth: Story = {
  args: {
    dataType: "price-data",
    message: (
      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <span>ETH/USD:</span>
          <span className="font-mono">$2,500</span>
        </div>
        <div className="flex justify-between">
          <span>BTC/USD:</span>
          <span className="font-mono">$45,000</span>
        </div>
      </div>
    ),
    dataSource: "pyth",
  },
};
