import type { Meta, StoryObj } from "@storybook/react";
import { AgentChatLine } from "./AgentChatLine";
// import autonomeIcon from "./assets/ai/autonome.svg";
// import chatgptIcon from "./assets/ai/chatgpt-color.svg";
// import claudeIcon from "./assets/ai/claude.svg";
// import deepseekIcon from "./assets/ai/deepseek.svg";
// import openrouterIcon from "./assets/ai/openrouter.svg";

const meta: Meta<typeof AgentChatLine> = {
  title: "Components/AgentChatLine",
  component: AgentChatLine,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[800px] p-4 bg-gray-900">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AgentChatLine>;

const demoAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

export const Claude: Story = {
  args: {
    agentName: "Claude",
    agentBorderColor: "#7C3AED",
    message: "Hello! I'm Claude, an AI assistant. How can I help you today?",
    sentiment: "Friendly",
    creatorAddress: demoAddress,
    // additionalIcons: [claudeIcon.src],
  },
};

export const GPT4: Story = {
  args: {
    agentName: "GPT-4",
    agentBorderColor: "#10B981",
    message:
      "I noticed you're working on a coding project. Would you like some assistance with that?",
    sentiment: "Helpful",
    creatorAddress: "0x1234567890123456789012345678901234567890",
    // additionalIcons: [chatgptIcon.src],
  },
};

export const LongMessage: Story = {
  args: {
    agentName: "Claude",
    agentBorderColor: "#7C3AED",
    message:
      "This is a very long message that will demonstrate the text truncation and tooltip functionality. It contains multiple sentences and should definitely exceed the 5-line limit we've set. Let's add even more text to make sure it gets truncated properly. The tooltip should show the full text when hovering over the truncated message. We can add even more text to really push the limits of the truncation. This could include technical details, code snippets, or any other lengthy content that needs to be displayed in a compact way while still being accessible through the tooltip.",
    sentiment: "Detailed",
    creatorAddress: "0x9876543210987654321098765432109876543210",
    // additionalIcons: [claudeIcon.src],
  },
};

export const NoSentiment: Story = {
  args: {
    agentName: "Claude",
    agentBorderColor: "#7C3AED",
    message: "This message has no sentiment indicator.",
    showSentiment: false,
    creatorAddress: "0x5432109876543210987654321098765432109876",
    // additionalIcons: [claudeIcon.src],
  },
};

export const WithAvatar: Story = {
  args: {
    agentName: "AI Agent",
    agentImageUrl: "https://avatars.githubusercontent.com/u/1",
    agentBorderColor: "#F59E0B",
    message: "This message includes an avatar image.",
    sentiment: "Informative",
    creatorAddress: "0x1111222233334444555566667777888899990000",
    // additionalIcons: [autonomeIcon.src],
  },
};

export const WithMultipleIcons: Story = {
  args: {
    agentName: "AI Agent",
    agentBorderColor: "#7C3AED",
    message: "This message shows multiple AI model icons in the badge tooltip.",
    sentiment: "Informative",
    creatorAddress: "0x2222333344445555666677778888999900001111",
    // additionalIcons: [
    //   autonomeIcon.src,
    //   chatgptIcon.src,
    //   claudeIcon.src,
    //   deepseekIcon.src,
    //   openrouterIcon.src,
    // ],
  },
};
