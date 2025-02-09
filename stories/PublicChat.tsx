"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { publicChatMessageInputSchema } from "@/lib/backend.types";
import { cn } from "@/lib/utils";
import { KeyboardEvent, useLayoutEffect, useRef, useState } from "react";
import { z } from "zod";
import { PublicChatLine } from "./PublicChatLine";

const MAX_MESSAGE_LENGTH = 500;

interface PublicChatProps {
  messages: z.infer<typeof publicChatMessageInputSchema>[];
  className?: string;
  onSendMessage?: (message: string) => void;
  currentUserAddress?: string;
  variant?: "default" | "compact";
  loading?: boolean;
}

export function PublicChat({
  messages,
  className,
  onSendMessage,
  currentUserAddress,
  variant = "default",
  loading = false,
}: PublicChatProps) {
  console.log("messages", messages);
  const [inputValue, setInputValue] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && inputValue.trim()) {
      onSendMessage?.(inputValue.trim());
      setInputValue("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_MESSAGE_LENGTH) {
      setInputValue(newValue);
    }
  };

  const charsRemaining = MAX_MESSAGE_LENGTH - inputValue.length;
  const showCounter = inputValue.length > 0;

  // Scroll to the bottom when messages update.
  useLayoutEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={cn("flex flex-col h-full bg-[#202123] w-full", className)}>
      <ScrollArea className="flex-1">
        <div className="flex flex-col py-4">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <span className="text-gray-400">Loading messages...</span>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <PublicChatLine
                  key={index}
                  id={msg.content.userId}
                  // TODO below is technically the wrong field, should be the user id, but I'm exhausted
                  address={String(msg.sender)}
                  avatarUrl={""}
                  message={msg.content.text}
                  timestamp={new Date(msg.content.timestamp)}
                  variant={variant}
                />
              ))}
            </>
          )}
          {/* Dummy div to scroll into view */}
          <div ref={endOfMessagesRef} />
        </div>
      </ScrollArea>
      {onSendMessage && currentUserAddress && (
        <div className="p-4 mt-2 relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Message"
            maxLength={MAX_MESSAGE_LENGTH}
            className="w-full px-4 py-2 bg-[#383A40] text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {showCounter && (
            <div className="absolute right-6 bottom-6 text-xs text-gray-400 bg-[#383A40]/80 px-2 py-1 rounded">
              {charsRemaining}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
