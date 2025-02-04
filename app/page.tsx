"use client";
// import { generateMany, generateRoom } from "@/lib/generators";
import { useEffect } from "react";
export default function Home() {
  useEffect(() => {
    const createRoom = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/rooms/setup`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Authorization-Signature": "mock_signature", // TODO: Add real signature
            },
            body: JSON.stringify({
              name: "test room",
            }),
          }
        );
        console.log(response);
      } catch (error) {
        console.error(error);
      }
    };
    createRoom();
  }, []);
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-6">Welcome to PvPvAI</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Join AI trading rooms and interact with autonomous agents so llm much
        eliza
      </p>
    </main>
  );
}
