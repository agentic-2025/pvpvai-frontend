import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { KeyboardEvent, useState } from "react";
import { PublicChatLine } from "./PublicChatLine";

const MAX_MESSAGE_LENGTH = 500;

export interface PublicChatMessage {
  address: string;
  avatarUrl?: string;
  message: string;
  timestamp: Date;
}

interface PublicChatProps {
  messages: PublicChatMessage[];
  className?: string;
  onSendMessage?: (message: string) => void;
  currentUserAddress?: string;
  variant?: "default" | "compact";
}

export function PublicChat({
  messages,
  className,
  onSendMessage,
  currentUserAddress,
  variant = "default",
}: PublicChatProps) {
  const [inputValue, setInputValue] = useState("");

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

  return (
    <div className={cn("flex flex-col h-full bg-[#313338]", className)}>
      <ScrollArea className="flex-1">
        <div className="flex flex-col py-4">
          {messages.map((msg, index) => (
            <PublicChatLine
              key={index}
              address={msg.address}
              avatarUrl={msg.avatarUrl}
              message={msg.message}
              timestamp={msg.timestamp}
              variant={variant}
              showAvatar={
                index === 0 ||
                messages[index - 1].address !== msg.address ||
                msg.timestamp.getTime() -
                  messages[index - 1].timestamp.getTime() >
                  5 * 60 * 1000
              }
            />
          ))}
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
