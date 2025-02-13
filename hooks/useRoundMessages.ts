// import { useEffect, useState } from "react";
// import { publicChatMessageInputSchema, AllAiChatMessageSchemaTypes } from "@/lib/backend.types";
// import { z } from "zod";

// // COMMENT: Manage separate user+AI states, clear on round change
// interface UseRoundMessagesResult {
//   messages: z.infer<typeof publicChatMessageInputSchema>[];
//   aiChatMessages: AllAiChatMessageSchemaTypes[];
//   handleNewMessage: (msg: z.infer<typeof publicChatMessageInputSchema>) => void;
//   handleNewAiMessage: (msg: AllAiChatMessageSchemaTypes) => void;
//   clearMessages: () => void;
// }

// export function useRoundMessages(roundId: number | null): UseRoundMessagesResult {
//   const [messages, setMessages] = useState<z.infer<typeof publicChatMessageInputSchema>[]>([]);
//   const [aiChatMessages, setAiChatMessages] = useState<AllAiChatMessageSchemaTypes[]>([]);

//   useEffect(() => {
//     if (roundId !== null) {
//       const timer = setTimeout(() => {
//         // COMMENT: Clear message arrays
//         setMessages([]);
//         setAiChatMessages([]);
//       }, 100);
//       return () => clearTimeout(timer);
//     }
//   }, [roundId]);

//   return {
//     messages,
//     aiChatMessages,
//     handleNewMessage: (msg) => setMessages((prev) => [...prev, msg]),
//     handleNewAiMessage: (msg) => setAiChatMessages((prev) => [...prev, msg]),
//     clearMessages: () => {
//       setMessages([]);
//       setAiChatMessages([]);
//     },
//   };
// }
