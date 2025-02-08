import type { Meta, StoryObj } from "@storybook/react";
import { RoomTableRow } from "./RoomTableRow";
import { generateRoom } from "@/lib/generators";
import { Table, TableBody } from "@/components/ui/table";

const meta = {
  title: "Components/RoomTableRow",
  component: RoomTableRow,
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
      <Table>
        <TableBody>
          <Story />
        </TableBody>
      </Table>
    ),
  ],
} satisfies Meta<typeof RoomTableRow>;

export default meta;
type Story = StoryObj<typeof meta>;

const buySellRoom = generateRoom({
  type_id: 1,
});

const predictionRoom = generateRoom({
  type_id: 2,
});

export const BuySellVariant: Story = {
  args: {
    room: buySellRoom,
    showRoomType: false,
    showToken: true,
  },
};

export const PredictionMarketVariant: Story = {
  args: {
    room: predictionRoom,
    showRoomType: true,
    showToken: false,
  },
};
