import type { Meta, StoryObj } from "@storybook/react";
import { AgentAvatar } from "./AgentAvatar";
import demoImage from "./assets/demo-personalities/godzilla.jpg";

const meta: Meta<typeof AgentAvatar> = {
  title: "Components/AgentAvatar",
  component: AgentAvatar,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
    },
  },
};

export default meta;
type Story = StoryObj<typeof AgentAvatar>;

const baseArgs = {
  name: "Agent Smith",
  borderColor: "#FF7B00",
  imageUrl: demoImage.src,
};

export const Large: Story = {
  args: {
    ...baseArgs,
    variant: "lg",
  },
};

export const Medium: Story = {
  args: {
    ...baseArgs,
    variant: "md",
  },
};

export const Small: Story = {
  args: {
    ...baseArgs,
    variant: "sm",
  },
};

export const ExtraSmall: Story = {
  args: {
    ...baseArgs,
    variant: "xs",
  },
};

export const LargeWithoutImage: Story = {
  args: {
    ...baseArgs,
    variant: "lg",
    imageUrl: undefined,
  },
};

export const MediumWithoutImage: Story = {
  args: {
    ...baseArgs,
    variant: "md",
    imageUrl: undefined,
  },
};

export const SmallWithoutImage: Story = {
  args: {
    ...baseArgs,
    variant: "sm",
    imageUrl: undefined,
  },
};

export const ExtraSmallWithoutImage: Story = {
  args: {
    ...baseArgs,
    variant: "xs",
    imageUrl: undefined,
  },
};
