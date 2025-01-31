import type { Meta, StoryObj } from "@storybook/react";
import { AgentBadge } from "./AgentBadge";
import demoImage from "./assets/demo-personalities/godzilla.jpg";
import gavelIcon from "./assets/pvp/gavel.svg";
import poisonIcon from "./assets/pvp/poison.svg";
import silenceIcon from "./assets/pvp/silence.svg";

const meta = {
  title: "Components/AgentBadge",
  component: AgentBadge,
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
} satisfies Meta<typeof AgentBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseArgs = {
  id: "agent1",
  name: "Agent Smith",
  color: "#FF7B00",
};

// Medium Variants
export const MediumDarkColor: Story = {
  args: {
    ...baseArgs,
    variant: "md",
  },
};

export const MediumWithAvatar: Story = {
  args: {
    ...baseArgs,
    variant: "md",
    avatar: demoImage.src,
  },
};

export const MediumLightColor: Story = {
  args: {
    ...baseArgs,
    color: "#FFE5CC",
    variant: "md",
  },
};

export const MediumLongName: Story = {
  args: {
    ...baseArgs,
    name: "Agent Smith With A Very Long Name",
    variant: "md",
  },
};

export const MediumShortName: Story = {
  args: {
    ...baseArgs,
    name: "Bob",
    variant: "md",
  },
};

// Small Variants
export const SmallDarkColor: Story = {
  args: {
    ...baseArgs,
    variant: "sm",
  },
};

export const SmallWithAvatar: Story = {
  args: {
    ...baseArgs,
    variant: "sm",
    avatar: demoImage.src,
  },
};

export const SmallLightColor: Story = {
  args: {
    ...baseArgs,
    color: "#FFE5CC",
    variant: "sm",
  },
};

export const SmallLongName: Story = {
  args: {
    ...baseArgs,
    name: "Agent Smith With A Very Long Name",
    variant: "sm",
  },
};

export const SmallShortName: Story = {
  args: {
    ...baseArgs,
    name: "Bob",
    variant: "sm",
  },
};

// Extra Small Variants
export const ExtraSmallDarkColor: Story = {
  args: {
    ...baseArgs,
    variant: "xs",
    borderColor: "#FFF",
  },
};

export const ExtraSmallWithAvatar: Story = {
  args: {
    ...baseArgs,
    variant: "xs",
    avatar: demoImage.src,
    borderColor: "#FFF",
  },
};

export const ExtraSmallLightColor: Story = {
  args: {
    ...baseArgs,
    color: "#FFE5CC",
    variant: "xs",
  },
};

export const ExtraSmallLongName: Story = {
  args: {
    ...baseArgs,
    name: "Agent Smith With A Very Long Name",
    variant: "xs",
  },
};

export const ExtraSmallShortName: Story = {
  args: {
    ...baseArgs,
    name: "Bob",
    variant: "xs",
  },
};

const demoAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

export const Default: Story = {
  args: {
    id: "agent1",
    name: "Test Agent",
    color: "#7C3AED",
    creatorAddress: demoAddress,
  },
};

export const WithAvatar: Story = {
  args: {
    id: "agent2",
    name: "Avatar Agent",
    color: "#10B981",
    avatar: "https://avatars.githubusercontent.com/u/1",
    creatorAddress: "0x1234567890123456789012345678901234567890",
  },
};

export const Small: Story = {
  args: {
    id: "agent3",
    name: "Small Agent",
    color: "#F59E0B",
    variant: "sm",
    creatorAddress: "0x9876543210987654321098765432109876543210",
  },
};

export const WithIcons: Story = {
  args: {
    id: "agent4",
    name: "Icon Agent",
    color: "#7C3AED",
    creatorAddress: "0x5432109876543210987654321098765432109876",
    additionalIcons: [gavelIcon.src, silenceIcon.src, poisonIcon.src],
  },
};

export const FullExample: Story = {
  args: {
    id: "agent5",
    name: "Complete Agent",
    color: "#10B981",
    avatar: "https://avatars.githubusercontent.com/u/1",
    creatorAddress: "0x1111222233334444555566667777888899990000",
    popularity: 42,
    additionalIcons: [gavelIcon.src],
  },
};
