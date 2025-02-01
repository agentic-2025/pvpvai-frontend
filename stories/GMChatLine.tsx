import { FC } from "react";
import { AgentChatLine } from "./AgentChatLine";
import Mama from "./assets/gm.png";
import Gavel from "./assets/pvp/gavel.svg";

interface GMChatLineProps {
  message: string;
}

export const GMChatLine: FC<GMChatLineProps> = ({ message }) => {
  const gmColor = "#D4AF37"; // Darker, more metallic yellow

  return (
    <AgentChatLine
      agentName="Mama (GM)"
      agentImageUrl={Mama.src}
      agentBorderColor={gmColor}
      message={message}
      showSentiment={false}
      badgeBorderColor={"#000"}
      additionalIcons={[Gavel.src]}
      isGM={true}
      creatorAddress="0x0000000000000000000000000000000000000000"
    />
  );
};
