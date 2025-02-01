import type { Meta, StoryObj } from "@storybook/react";
import { ThemeProvider } from "next-themes";
import { base, baseSepolia, flowTestnet } from "viem/chains";
import { CreateRoomModal } from "./CreateRoomModal";
const meta = {
  title: "Modals/CreateRoomModal",
  component: CreateRoomModal,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
    },
    themes: {
      default: "dark",
    },
    docs: {
      description: {
        component:
          "A multi-step modal for creating new rooms with various configurations.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Story />
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof CreateRoomModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseArgs = {
  open: true,
  onOpenChange: () => {},
};

export const Step1WithDraft: Story = {
  args: {
    ...baseArgs,
    initialState: {
      step: 1,
      pvpEnabled: false,
      pvpRules: [],
      selectedAgents: [],
    },
  },
};

export const Step2RoomTypeSelection: Story = {
  args: {
    ...baseArgs,
    initialState: {
      step: 2,
      pvpEnabled: false,
      pvpRules: [],
      selectedAgents: [],
    },
  },
};

export const Step3ChainSelection: Story = {
  args: {
    ...baseArgs,
    initialState: {
      step: 3,
      roomType: 1, // Buy/Sell
      pvpEnabled: false,
      pvpRules: [],
      selectedAgents: [],
    },
  },
};

export const Step4AgentSelection: Story = {
  args: {
    ...baseArgs,
    initialState: {
      step: 4,
      roomType: 1,
      chain: baseSepolia,
      pvpEnabled: false,
      pvpRules: [],
      selectedAgents: [],
    },
  },
};

export const Step5RoomSettings: Story = {
  args: {
    ...baseArgs,
    initialState: {
      step: 5,
      roomType: 1,
      chain: baseSepolia,
      selectedAgents: [1, 2],
      pvpEnabled: false,
      pvpRules: [],
    },
  },
};

export const Step6TypeSpecificSettingsBuySell: Story = {
  args: {
    ...baseArgs,
    initialState: {
      step: 6,
      roomType: 1,
      chain: base,
      selectedAgents: [1, 2],
      settings: {
        name: "Test Room",
        image_url: "https://example.com/image.png",
        color: "#000000",
        round_time: 300,
      },
      pvpEnabled: false,
      pvpRules: [],
    },
  },
};

export const Step6TypeSpecificSettingsLongShort: Story = {
  args: {
    ...baseArgs,
    initialState: {
      step: 6,
      roomType: 2,
      chain: base,
      selectedAgents: [1, 2],
      settings: {
        name: "Test Room",
        image_url:
          "https://d3r81g40ycuhqg.cloudfront.net/wallet/wais/3b/bf/3bbf118b5e6dc2f9e7fc607a6e7526647b4ba8f0bea87125f971446d57b296d2-MDNmNjY0MmEtNGFiZi00N2I0LWIwMTItMDUyMzg2ZDZhMWNm",
        color: "#000000",
        round_time: 300,
      },
      pvpEnabled: false,
      pvpRules: [],
    },
  },
};

export const Step6TypeSpecificSettingsChat: Story = {
  args: {
    ...baseArgs,
    initialState: {
      step: 6,
      roomType: 3,
      chain: flowTestnet,
      selectedAgents: [1, 2],
      settings: {
        name: "Test Room",
        image_url: "https://example.com/image.png",
        color: "#FFFFF",
        round_time: 300,
      },
      pvpEnabled: false,
      pvpRules: [],
    },
  },
};

export const Step7PvPSettings: Story = {
  args: {
    ...baseArgs,
    initialState: {
      step: 7,
      roomType: 1,
      chain: baseSepolia,
      selectedAgents: [1, 2],
      settings: {
        name: "Test Room",
        image_url: "https://example.com/image.png",
        color: "#000000",
        round_time: 300,
      },
      pvpEnabled: false,
      pvpRules: [],
    },
  },
};

export const Step8Confirmation: Story = {
  args: {
    ...baseArgs,
    initialState: {
      step: 8,
      roomType: 1,
      chain: flowTestnet,
      selectedAgents: [1, 2],
      settings: {
        name: "Test Room",
        image_url: "https://example.com/image.png",
        color: "#000000",
        round_time: 300,
      },
      tokenInfo: {
        address: "0x4ed4e862860bed51a9570b96d89af5e1b0efefed",
        chainId: 8453,
        decimals: 18,
        image:
          "https://d3r81g40ycuhqg.cloudfront.net/wallet/wais/3b/bf/3bbf118b5e6dc2f9e7fc607a6e7526647b4ba8f0bea87125f971446d57b296d2-MDNmNjY0MmEtNGFiZi00N2I0LWIwMTItMDUyMzg2ZDZhMWNm",
        name: "DEGEN",
        symbol: "DEGEN",
      },
      pvpEnabled: true,
      pvpRules: ["SILENCE", "DEAFEN"],
    },
  },
};
