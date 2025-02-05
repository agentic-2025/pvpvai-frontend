import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AgentBadge } from "./AgentBadge";
import demoImage from "./assets/demo-personalities/godzilla.jpg";
import gavelIcon from "./assets/pvp/gavel.svg";
import poisonIcon from "./assets/pvp/poison.svg";
import silenceIcon from "./assets/pvp/silence.svg";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

const demoAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

// Base args that match the AgentBadgeProps interface
const baseArgs = {
  id: 1,
  name: "Agent Smith",
  color: "#FF7B00",
  creatorAddress: demoAddress,
};

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
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof AgentBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

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
    variant: "md",
    color: "#FFE5CC",
  },
};

export const MediumLongName: Story = {
  args: {
    ...baseArgs,
    variant: "md",
    name: "Agent Smith With A Very Long Name",
  },
};

export const MediumShortName: Story = {
  args: {
    ...baseArgs,
    variant: "md",
    name: "Bob",
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
    variant: "sm",
    color: "#FFE5CC",
  },
};

export const SmallLongName: Story = {
  args: {
    ...baseArgs,
    variant: "sm",
    name: "Agent Smith With A Very Long Name",
  },
};

export const SmallShortName: Story = {
  args: {
    ...baseArgs,
    variant: "sm",
    name: "Bob",
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
    variant: "xs",
    color: "#FFE5CC",
  },
};

export const ExtraSmallLongName: Story = {
  args: {
    ...baseArgs,
    variant: "xs",
    name: "Agent Smith With A Very Long Name",
  },
};

export const ExtraSmallShortName: Story = {
  args: {
    ...baseArgs,
    variant: "xs",
    name: "Bob",
  },
};

export const Default: Story = {
  args: {
    id: 1,
    name: "Test Agent",
    color: "#7C3AED",
    creatorAddress: demoAddress,
  },
};

export const WithAvatar: Story = {
  args: {
    id: 1,
    name: "Avatar Agent",
    color: "#10B981",
    avatar: "https://avatars.githubusercontent.com/u/1",
    creatorAddress: demoAddress,
  },
};

export const Small: Story = {
  args: {
    id: 1,
    name: "Small Agent",
    color: "#F59E0B",
    variant: "sm",
    creatorAddress: demoAddress,
  },
};

export const WithIcons: Story = {
  args: {
    id: 1,
    name: "Icon Agent",
    color: "#7C3AED",
    creatorAddress: demoAddress,
    additionalIcons: [gavelIcon.src, silenceIcon.src, poisonIcon.src],
  },
};

export const FullExample: Story = {
  args: {
    id: 1,
    name: "Complete Agent",
    color: "#10B981",
    avatar: demoImage.src,
    creatorAddress: demoAddress,
    additionalIcons: [gavelIcon.src],
  },
};
