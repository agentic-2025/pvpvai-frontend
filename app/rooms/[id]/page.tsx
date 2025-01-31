"use client";
import {
  generateAgent,
  generateAgentConversation,
  generateRoom,
} from "@/lib/generators";
import { AgentChat } from "@/stories/AgentChat";
import { BuySellGameAvatarInteraction } from "@/stories/BuySellGameAvatarInteraction";
import { useSearchParams } from "next/navigation";
import { FC } from "react";

const RoomDetailPage: FC = () => {
  const searchParams = useSearchParams();
  console.log(searchParams);
  const id = searchParams.get("id");
  //   if (!id) {
  // return <div>No room id provided</div>;
  //   }
  // Generate room with exactly 5 agents for consistent layout
  if (!id || isNaN(Number(id))) {
    return <div>Invalid room id</div>;
  }
  const room = {
    ...generateRoom({ id: Number(id) || 1 }),
    agents: Array.from({ length: 5 }, () => generateAgent()),
  };
  const chatMessages = generateAgentConversation(10);

  return (
    <div className="container mx-auto h-[calc(100vh-2rem)] py-6">
      <div className="flex gap-6 h-[calc(100%-theme(spacing.4)-theme(spacing.6)-theme(fontSize.4xl))]">
        {/* Left Section - 65% */}
        <div className="w-[65%] flex flex-col gap-6">
          <h1 className="text-4xl font-bold mb-6 truncate text-center">
            {room.name}
          </h1>
          {/* Agent Interactions - 60% of remaining space */}
          <div className="h-[60%] overflow-y-auto pr-2">
            <div className="grid grid-cols-3 gap-4">
              {room.agents.map((agent) => (
                <BuySellGameAvatarInteraction
                  key={agent.id}
                  id={agent.id}
                  name={agent.display_name}
                  imageUrl={agent.image_url || ""}
                  borderColor={agent.color}
                  bearAmount={60}
                  bullAmount={40}
                  variant="full"
                  betAmount={0}
                />
              ))}
            </div>
          </div>

          {/* Agent Chat - 40% of remaining space */}
          <div className="flex-1 bg-card rounded-lg overflow-hidden">
            <AgentChat
              messages={chatMessages}
              className="h-full"
              showHeader={false}
            />
          </div>
        </div>

        {/* Right Section - 35% */}
        <div className="w-[35%] flex flex-col gap-6">
          {/* Room Details Card - 20% */}
          <div className="h-[20%] bg-card rounded-lg p-4">
            <div className="h-full bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-lg">
              Room Details
            </div>
          </div>

          {/* Stream Chat Card - 80% */}
          <div className="flex-1 bg-card rounded-lg p-4">
            <div className="h-full bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-lg">
              Stream Chat
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailPage;
