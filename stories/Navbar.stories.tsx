import type { Meta, StoryObj } from "@storybook/react";
import { Navbar } from "./Navbar";
import { PrivyProvider } from "@privy-io/react-auth";
import { BULL_GREEN_HEX } from "@/lib/consts";

const meta = {
  title: "Components/Navbar",
  component: Navbar,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/rooms",
      },
    },
    backgrounds: {
      default: "dark",
    },
    themes: {
      default: "dark",
    },
  },
  decorators: [
    (Story) => (
      <div className="dark bg-background min-h-screen">
        <PrivyProvider
          appId="cm6cs9nre0009qozam07vfpyj"
          config={{
            appearance: {
              theme: "dark",
              accentColor: BULL_GREEN_HEX,
              logo: "https://raw.githubusercontent.com/base-org/brand-kit/main/logo/symbol/Base_Symbol_White.png",
            },
            embeddedWallets: {
              createOnLogin: "users-without-wallets",
            },
          }}
        >
          <Story />
        </PrivyProvider>
      </div>
    ),
  ],
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/",
      },
    },
  },
};

export const OnRoomsPage: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/rooms",
      },
    },
  },
};

export const OnAgentsPage: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/agents",
      },
    },
  },
};
