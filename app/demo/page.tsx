"use client";

import { WSMessageInput } from "@/lib/backend.types";
import { supabase } from "@/lib/config";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
// import { WSMessageInput, WSMessageOutput } from "../../lib/backend.types";
// Demo user ID - in a real app this would come from authentication
// const DEMO_USER_ID = 1;

export default function DemoPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<
    number | null
  >(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when new messages arrive
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [messages]);

  useEffect(() => {
    // Load initial messages from Supabase
    const loadMessages = async () => {
      setIsLoading(true);
      console.log("Loading messages...");
      const { data, error } = await supabase
        .from("round_user_messages")
        .select("*")
        .eq("round_id", 1)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading messages:", error.message);
        return;
      }

      console.log("Loaded messages:", data);
      setMessages(data || []);
      setIsLoading(false);
    };

    // Initialize WebSocket connection

    const initWebSocket = () => {
      const ws = new WebSocket("ws://localhost:3000/ws");

      ws.onopen = () => {
        console.log("WebSocket connected");
        ws.send(
          JSON.stringify({
            type: "subscribe_room",
            author: 1,
            timestamp: Date.now(),
            content: {
              roomId: 1,
            },
          } as WSMessageInput)
        );
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data) as WSMessageInput;
        console.log("Received message:", message);
        const timestamp = Date.now();
        setLastMessageTimestamp(timestamp);
        // Add new message to the start of the list with timestamp
        setMessages((prev) => [{ ...message, _timestamp: timestamp }, ...prev]);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        // Attempt to reconnect after a delay
        setTimeout(initWebSocket, 5000);
      };

      setWsConnection(ws);
    };

    loadMessages();
    initWebSocket();

    // Cleanup WebSocket connection on unmount
    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, []);

  return (
    <div className="p-4 min-h-[600px] h-screen flex flex-col bg-gray-900">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-white">Demo Room Messages</h1>
      </div>
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-[500px] overflow-y-auto space-y-4 bg-gray-800 rounded-lg p-4 relative"
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            No messages yet. Messages will appear here as they arrive.
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={message._timestamp || index}
                initial={
                  message._timestamp === lastMessageTimestamp
                    ? { opacity: 0, y: -20 }
                    : false
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <pre className="p-4 rounded-lg overflow-x-auto bg-gray-700 text-white">
                  {JSON.stringify(message, null, 2)}
                </pre>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
