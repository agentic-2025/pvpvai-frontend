/*
I forgot I wrote this and created ObservationChatLine.tsx.
I'm keeping it here for now, should merge it with ObservationChatLine.tsx since this is more robust
*/

// import { FC, ReactNode } from "react";
// import { AgentChatLine } from "./AgentChatLine";
// import BaseIcon from "./assets/crypto/base.svg";
// import PythIcon from "./assets/crypto/pyth.svg";
// import DollarSign from "./assets/dollar-sign.svg";
// import NewsIcon from "./assets/news.svg";
// import RedditIcon from "./assets/reddit.svg";
// import WalletIcon from "./assets/wallet.svg";

// type DataType = "news" | "social-media" | "wallet-balances" | "price-data";

// interface ExternalDataChatLineProps {
//   dataType: DataType;
//   message: string | ReactNode;
//   dataSource?: string;
// }

// const getIconForType = (dataType: DataType, dataSource?: string): string => {
//   switch (dataType) {
//     case "news":
//       return NewsIcon.src;
//     case "social-media":
//       return RedditIcon.src;
//     case "wallet-balances":
//       return dataSource === "coinbase-sdk" ? BaseIcon.src : WalletIcon.src;
//     case "price-data":
//       return dataSource === "pyth" ? PythIcon.src : DollarSign.src;
//     default:
//       return DollarSign.src;
//   }
// };

// const getMessagePrefix = (dataType: DataType): string => {
//   switch (dataType) {
//     case "news":
//       return "Game Master has delivered recent news to agents:\n";
//     case "social-media":
//       return "Game Master has delivered reddit threads to agents:\n";
//     case "wallet-balances":
//       return "Game Master has informed agents of the wallet balances of all agents in the room:\n";
//     case "price-data":
//       return "Game Master has delivered current prices to agents:\n";
//     default:
//       return `Game Master has delivered data of an unknown type (${dataType}) to agents:\n`;
//   }
// };

// export const ExternalDataChatLine: FC<ExternalDataChatLineProps> = ({
//   dataType,
//   message,
//   dataSource,
// }) => {
//   const iconSrc = getIconForType(dataType, dataSource);
//   const borderColor = "#D4AF37"; //GM Color

//   return (
//     <AgentChatLine
//       agentId={0}
//       agentName="Data"
//       agentImageUrl={iconSrc}
//       agentBorderColor={borderColor}
//       message={
//         <div className="flex flex-col gap-0.5">
//           {getMessagePrefix(dataType)}
//           <div className="text-sm">{message}</div>
//         </div>
//       }
//       isGM={true}
//     />
//   );
// };
