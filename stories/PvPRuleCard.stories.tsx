import type { Meta, StoryObj } from "@storybook/react";
import { PvPRuleCard } from "./PvPRuleCard";

const meta = {
  title: "Components/PvPRuleCard",
  component: PvPRuleCard,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[240px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PvPRuleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Individual variants
export const Silence: Story = {
  args: {
    variant: "SILENCE",
  },
};

export const SilenceSelected: Story = {
  args: {
    variant: "SILENCE",
    selected: true,
  },
};

export const Attack: Story = {
  args: {
    variant: "ATTACK",
  },
};

export const AttackSelected: Story = {
  args: {
    variant: "ATTACK",
    selected: true,
  },
};

export const Poison: Story = {
  args: {
    variant: "POISON",
  },
};

export const PoisonSelected: Story = {
  args: {
    variant: "POISON",
    selected: true,
  },
};

export const MindControl: Story = {
  args: {
    variant: "MIND_CONTROL",
  },
};

export const MindControlSelected: Story = {
  args: {
    variant: "MIND_CONTROL",
    selected: true,
  },
};

export const Deceive: Story = {
  args: {
    variant: "DECEIVE",
  },
};

export const DeceiveSelected: Story = {
  args: {
    variant: "DECEIVE",
    selected: true,
  },
};

// Add new individual variants
export const Frenzy: Story = {
  args: {
    variant: "FRENZY",
  },
};

export const FrenzySelected: Story = {
  args: {
    variant: "FRENZY",
    selected: true,
  },
};

export const Chaos: Story = {
  args: {
    variant: "CHAOS",
  },
};

export const ChaosSelected: Story = {
  args: {
    variant: "CHAOS",
    selected: true,
  },
};

// Impact level showcases
export const LowImpactRules: Story = {
  args: {
    variant: "SILENCE",
  },
  decorators: [
    () => (
      <div className="w-[800px] grid grid-cols-4 gap-4">
        <PvPRuleCard variant="SILENCE" />
        <PvPRuleCard variant="DEAFEN" />
        <PvPRuleCard variant="ATTACK" />
        <PvPRuleCard variant="OVERLOAD" />
      </div>
    ),
  ],
};

export const ModerateImpactRules: Story = {
  args: {
    variant: "POISON",
  },
  decorators: [
    () => (
      <div className="w-[800px] grid grid-cols-3 gap-4">
        <PvPRuleCard variant="POISON" />
        <PvPRuleCard variant="BLIND" />
        <PvPRuleCard variant="AMNESIA" />
      </div>
    ),
  ],
};

export const HighImpactRules: Story = {
  args: {
    variant: "DECEIVE",
  },
  decorators: [
    () => (
      <div className="w-[800px] grid grid-cols-3 gap-4">
        <PvPRuleCard variant="DECEIVE" />
        <PvPRuleCard variant="CONFUSE" />
        <PvPRuleCard variant="MIND_CONTROL" />
      </div>
    ),
  ],
};

// Add new impact level showcases
export const OPRules: Story = {
  args: {
    variant: "FRENZY",
  },
  decorators: [
    () => (
      <div className="w-[800px] grid grid-cols-1 gap-4">
        <PvPRuleCard variant="FRENZY" />
      </div>
    ),
  ],
};

export const GameBreakerRules: Story = {
  args: {
    variant: "CHAOS",
  },
  decorators: [
    () => (
      <div className="w-[800px] grid grid-cols-1 gap-4">
        <PvPRuleCard variant="CHAOS" />
      </div>
    ),
  ],
};

// All variants grouped by impact
export const AllVariants: Story = {
  args: {
    variant: "SILENCE",
  },
  decorators: [
    () => (
      <div className="w-[800px] flex flex-col gap-8">
        <div>
          <h3 className="text-lg font-medium text-gray-300 mb-4">
            Low Impact Rules
          </h3>
          <div className="grid grid-cols-4 gap-4">
            <PvPRuleCard variant="SILENCE" />
            <PvPRuleCard variant="DEAFEN" />
            <PvPRuleCard variant="ATTACK" />
            <PvPRuleCard variant="OVERLOAD" />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-300 mb-4">
            Moderate Impact Rules
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <PvPRuleCard variant="POISON" />
            <PvPRuleCard variant="BLIND" />
            <PvPRuleCard variant="AMNESIA" />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-300 mb-4">
            High Impact Rules
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <PvPRuleCard variant="DECEIVE" />
            <PvPRuleCard variant="CONFUSE" />
            <PvPRuleCard variant="MIND_CONTROL" />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-300 mb-4">OP Rules</h3>
          <div className="grid grid-cols-1 gap-4">
            <PvPRuleCard variant="FRENZY" />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-300 mb-4">
            Game Breaker Rules
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <PvPRuleCard variant="CHAOS" />
          </div>
        </div>
      </div>
    ),
  ],
};
