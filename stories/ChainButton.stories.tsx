import type { Meta, StoryObj } from "@storybook/react";
import { ChainButton } from "./ChainButton";
import arbitrumIcon from "./assets/crypto/arbitrum-full-primary.svg";
import baseIcon from "./assets/crypto/base-full-white.svg";
import flowIcon from "./assets/crypto/flow-full-white.svg";
import solanaIcon from "./assets/crypto/solana-full-color.svg";

const meta = {
  title: "Components/ChainButton",
  component: ChainButton,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ChainButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ... rest of the stories remain the same, just replace NetworkButton with ChainButton
