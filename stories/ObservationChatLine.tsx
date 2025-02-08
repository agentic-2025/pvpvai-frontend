import { observationMessageAiChatOutputSchema } from "@/lib/backend.types";
import { FC } from "react";
import { z } from "zod";
import { AgentChatLine } from "./AgentChatLine";
import OracleIcon from "./assets/oracle.svg";

interface ObservationChatLineProps {
  message: z.infer<typeof observationMessageAiChatOutputSchema>;
}

export const ObservationChatLine: FC<ObservationChatLineProps> = ({
  message,
}) => {
  const borderColor = "#FFFFFF"; // White

  const messageContent = (
    <p className="italic">
      The oracle agent shared {message.content.observationType} with the agents
    </p>
  );

  return (
    <AgentChatLine
      agentId={message.content.agentId}
      agentName="Oracle Agent"
      agentImageUrl={OracleIcon.src}
      agentBorderColor={borderColor}
      message={messageContent}
      showSentiment={false}
      badgeBorderColor="#000"
      backgroundIcon={OracleIcon.src}
      backgroundImageOpacity={15} // 5 points lower than default 20
      isGM={false}
      creatorAddress="0x0000000000000000000000000000000000000000"
    />
  );
};
