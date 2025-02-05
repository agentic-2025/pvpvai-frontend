"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import supabase from "@/lib/config";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AgentAvatar } from "@/stories/AgentAvatar";
import { Textarea } from "@/components/ui/textarea";
import Loader from "@/components/loader";

// Define the expected type for an agent (only necessary fields for display)
type Agent = {
  id: number;
  image_url: string;
  color: string;
  display_name: string;
  single_sentence_summary: string;
  platform: string;
  endpoint: string;
  status: string;
  type: string;
  earnings: number | null;
  character_card: string; // JSON string
};

export default function AgentSummary() {
  const params = useParams();
  const id = params.id; // Ensure your route is something like /agent/[id]
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch only the necessary fields from Supabase
  useEffect(() => {
    const fetchAgent = async () => {
      const { data, error } = await supabase
        .from("agents")
        .select(
          `
          id,
          image_url,
          color,
          display_name,
          single_sentence_summary,
          platform,
          endpoint,
          status,
          type,
          earnings,
          character_card
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setAgent(data);
      }
      setLoading(false);
    };

    fetchAgent();
  }, [id]);

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-red-500">
        Error: {error}
      </div>
    );
  if (!agent)
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-gray-700">
        No agent found with id {id}
      </div>
    );

  // Try to parse the character_card to extract key fields.
  let characterCard: { [key: string]: any } = {};
  try {
    characterCard = JSON.parse(agent.character_card);
  } catch (e) {
    console.error("Error parsing character_card:", e);
  }

  // Helper function to display arrays as comma-separated strings.
  const displayArray = (value: any) =>
    Array.isArray(value) ? value.join(", ") : value;

  return (
    <div className="min-h-screen py-8">
      <Card className="p-8 max-w-4xl mx-auto bg-secondary/20 text-gray-200 shadow-2xl rounded-lg">
        <div className="flex flex-col items-center border-secondary-foreground border-b pb-6 mb-6">
          {/* Agent Image */}
          <AgentAvatar
            name={agent.display_name}
            imageUrl={agent.image_url || "/default-agent.png"}
            borderColor={agent.color}
            variant="lg"
          />

          {/* Basic Agent Info */}
          <h2 className="text-4xl font-extrabold mb-2">{agent.display_name}</h2>
          <p className="text-xl text-center max-w-xl">
            {agent.single_sentence_summary}
          </p>
        </div>

        {/* (Optional) You can uncomment this grid if you want to display more agent info */}
        {/*
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div>
            <Label className="font-semibold text-lg text-gray-100">Platform:</Label>
            <div className="text-base">{agent.platform}</div>
          </div>
          <div>
            <Label className="font-semibold text-lg text-gray-100">Endpoint:</Label>
            <div className="text-base">{agent.endpoint}</div>
          </div>
          <div>
            <Label className="font-semibold text-lg text-gray-100">Status:</Label>
            <div className={`text-base ${agent.status === "Active" ? "text-green-600" : "text-red-600"}`}>
              {agent.status}
            </div>
          </div>
          <div>
            <Label className="font-semibold text-lg text-gray-100">Type:</Label>
            <div className="text-base">{agent.type}</div>
          </div>
          <div>
            <Label className="font-semibold text-lg text-gray-100">Earnings:</Label>
            <div className="text-base">
              {agent.earnings !== null ? `${agent.earnings} USDC` : "N/A"}
            </div>
          </div>
        </div>
        */}

        {/* Character Card Section */}
        <div>
          {/* Display Name and Description if available */}
          {(characterCard?.name || characterCard?.description) && (
            <div className="mb-6">
              {characterCard?.name && (
                <div className="mb-2">
                  <Label className="font-semibold text-lg text-gray-100">
                    Name:
                  </Label>
                  <div className="text-base">{characterCard?.name}</div>
                </div>
              )}
              {characterCard?.description && (
                <div>
                  <Label className="font-semibold text-lg text-gray-100">Description:</Label>
                  <div className="text-base">{characterCard?.description}</div>
                </div>
              )}
            </div>
          )}

          {/* Display Bio, Lore, Desc, and Knowledge as read-only text areas */}
          {(characterCard?.bio ||
            characterCard?.lore ||
            characterCard?.desc ||
            characterCard?.knowledge) && (
            <div className="space-y-4">
              {characterCard?.bio && (
                <div>
                  <Label className="font-semibold text-lg text-gray-100">Bio:</Label>
                  <Textarea
                    readOnly
                    className="w-full p-2 text-base"
                    rows={4}
                    value={displayArray(characterCard?.bio)}
                  />
                </div>
              )}
              {characterCard?.lore && (
                <div>
                  <Label className="font-semibold text-lg text-gray-100">Lore:</Label>
                  <Textarea
                    readOnly
                    className="w-full p-2 text-base"
                    rows={4}
                    value={displayArray(characterCard?.lore)}
                  />
                </div>
              )}
              {characterCard?.desc && (
                <div>
                  <Label className="font-semibold text-lg text-gray-100">Description:</Label>
                  <Textarea
                    readOnly
                    className="w-full p-2 text-base"
                    rows={4}
                    value={displayArray(characterCard?.desc)}
                  />
                </div>
              )}
              {characterCard?.knowledge && (
                <div>
                  <Label className="font-semibold text-lg text-gray-100">Knowledge:</Label>
                  <Textarea
                    readOnly
                    className="w-full p-2 text-base"
                    rows={4}
                    value={displayArray(characterCard?.knowledge)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
