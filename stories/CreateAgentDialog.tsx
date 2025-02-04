"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ColorPicker } from "@/components/ui/color-picker";
import supabase from "@/lib/config"; // Ensure this is set up correctly

// Helper function to generate a random hex color.
const generateRandomColor = (includeHash = false) => {
  const randomColor = Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0");
  return includeHash ? `#${randomColor}` : randomColor;
};

const totalSteps = 7;

export default function CreateAgentModal() {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [agentData, setAgentData] = useState({
    name: "",
    displayName: "",
    imageUrl: "",
    color: "",
    singleSentenceSummary: "",
    description: "",
    platform: "",
    endpoint: "",
    type: "",
    ethWalletAddress: "",
    solWalletAddress: "",
    role: "",
    system: "",
    modelProvider: "google",
    model: "google/gemini-2.0-flash-thinking-exp:free",
    plugins: [] as string[],
    characterCard: {
      bio: "",
      lore: "",
      knowledge: "",
      modelProvider: "",
      desc: "",
      plugins: "",
      name: "",
      role: "",
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "plugins") {
      setAgentData({
        ...agentData,
        [name]: value.split(",").map((p) => p.trim()),
      });
    } else {
      setAgentData({ ...agentData, [name]: value });
    }
  };

  const handleCharacterCardChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setAgentData({
      ...agentData,
      characterCard: { ...agentData.characterCard, [name]: value },
    });
  };

  const handleColorChange = (color: string) => {
    setAgentData({ ...agentData, color });
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps - 1));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  // Header with a progress indicator (similar to room creation)
  const getStepTitle = () => {
    const stepTitles = [
      "Basic Info – General",
      "Basic Info – Details",
      "System",
      "Model Settings",
      "Plugins",
      "Character Card",
      "Confirmation",
    ];
    return (
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i < step ? "bg-primary" : "bg-secondary"
              }`}
            />
          ))}
        </div>
        <h2 className="text-2xl font-semibold text-white">
          {stepTitles[step]}
        </h2>
      </div>
    );
  };

  // Build payload and submit to Supabase.
  const handleSubmit = async () => {
    // Build payload mapping our agentData keys to the expected payload keys.
    const payload = {
      // Use the provided keys
      display_name: agentData.displayName,
      image_url: agentData.imageUrl,
      color: agentData.color,
      platform: agentData.platform,
      eth_wallet_address: agentData.ethWalletAddress,
      sol_wallet_address: agentData.solWalletAddress,
      single_sentence_summary: agentData.singleSentenceSummary,
      endpoint: agentData.endpoint,
      type: agentData.type,
      // Hard-coded values as in your sample
      status: "Down",
      last_health_check: null,
      // character_card is stored as a JSON string.
      character_card: JSON.stringify(agentData.characterCard),
      earnings: 0,
      creator_id: 1,
    };

    const { data, error } = await supabase
      .from("agents")
      .insert([payload])
      .select();

    if (error) {
      console.error("Error creating agent:", error);
      // You can show an error notification here.
    } else {
      console.log("Agent created successfully:", data);
      // Optionally, close the dialog and reset the form.
      setOpen(false);
      setStep(0);
      // Reset agentData if desired.
      // Reload the page after success
      window.location.reload();
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                name="name"
                value={agentData.name}
                onChange={handleChange}
                placeholder="Agent Name"
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input
                name="displayName"
                value={agentData.displayName}
                onChange={handleChange}
                placeholder="Agent Display Name"
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                name="imageUrl"
                value={agentData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.png"
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Single Sentence Summary</Label>
              <Input
                name="singleSentenceSummary"
                value={agentData.singleSentenceSummary}
                onChange={handleChange}
                placeholder="A short summary..."
                className="bg-muted"
              />
            </div>
            <div>
              <ColorPicker
                label="Agent Color"
                value={agentData.color}
                onChange={handleColorChange}
                generateRandomColor={() =>
                  handleColorChange(generateRandomColor(true))
                }
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Description</Label>
              <Textarea
                name="description"
                value={agentData.description}
                onChange={handleChange}
                placeholder="Agent Description"
                className="bg-muted"
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Input
                name="platform"
                value={agentData.platform}
                onChange={handleChange}
                placeholder="Platform"
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Endpoint</Label>
              <Input
                name="endpoint"
                value={agentData.endpoint}
                onChange={handleChange}
                placeholder="API Endpoint"
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Input
                name="type"
                value={agentData.type}
                onChange={handleChange}
                placeholder="Agent Type"
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Ethereum Wallet Address</Label>
              <Input
                name="ethWalletAddress"
                value={agentData.ethWalletAddress}
                onChange={handleChange}
                placeholder="0x..."
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Solana Wallet Address</Label>
              <Input
                name="solWalletAddress"
                value={agentData.solWalletAddress}
                onChange={handleChange}
                placeholder="Solana Address"
                className="bg-muted"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Input
                name="role"
                value={agentData.role}
                onChange={handleChange}
                placeholder="Agent Role (e.g., BTC Advocate)"
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>System Behavior</Label>
              <Textarea
                name="system"
                value={agentData.system}
                onChange={handleChange}
                placeholder="System Behavior"
                className="bg-muted"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label>Model Provider</Label>
              <Input
                name="modelProvider"
                value={agentData.modelProvider}
                readOnly
                className="bg-muted"
              />
            </div>
            <div>
              <Label>Model</Label>
              <Input
                name="model"
                value={agentData.model}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-2">
            <Label>Plugins (comma-separated)</Label>
            <Textarea
              name="plugins"
              value={agentData.plugins.join(", ")}
              onChange={handleChange}
              placeholder="e.g., plugin1, plugin2"
              className="bg-muted"
            />
          </div>
        );
      case 5:
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                name="bio"
                value={agentData.characterCard.bio}
                onChange={handleCharacterCardChange}
                placeholder="Character bio"
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Lore</Label>
              <Textarea
                name="lore"
                value={agentData.characterCard.lore}
                onChange={handleCharacterCardChange}
                placeholder="Character lore"
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Knowledge</Label>
              <Textarea
                name="knowledge"
                value={agentData.characterCard.knowledge}
                onChange={handleCharacterCardChange}
                placeholder="Character knowledge"
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Model Provider</Label>
              <Input
                name="modelProvider"
                value={agentData.characterCard.modelProvider}
                onChange={handleCharacterCardChange}
                placeholder="Character Card Model Provider"
                className="bg-muted"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Description</Label>
              <Textarea
                name="desc"
                value={agentData.characterCard.desc}
                onChange={handleCharacterCardChange}
                placeholder="Character description"
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Plugins</Label>
              <Input
                name="plugins"
                value={agentData.characterCard.plugins}
                onChange={handleCharacterCardChange}
                placeholder="Comma-separated plugins"
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                name="name"
                value={agentData.characterCard.name}
                onChange={handleCharacterCardChange}
                placeholder="Character Name"
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input
                name="role"
                value={agentData.characterCard.role}
                onChange={handleCharacterCardChange}
                placeholder="Character Role"
                className="bg-muted"
              />
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <p className="text-gray-400">
              Review your agent configuration before creating the agent.
            </p>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto text-white">
              {JSON.stringify(agentData, null, 2)}
            </pre>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
          Create New Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl bg-black border border-gray-700 rounded-lg p-6">
        <DialogHeader>
          <DialogTitle>{getStepTitle()}</DialogTitle>
        </DialogHeader>
        <Card className="bg-black border-none flex-1 p-4">
          {renderStepContent()}
        </Card>
        <div className="flex justify-between mt-6">
          <Button
            onClick={prevStep}
            disabled={step === 0}
            className="bg-gray-700 hover:bg-gray-500 text-white flex items-center gap-2"
          >
            <ChevronLeft size={18} /> Back
          </Button>
          {step < totalSteps - 1 ? (
            <Button
              onClick={nextStep}
              className="bg-primary text-white flex items-center gap-2"
            >
              Next <ChevronRight size={18} />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-green-600 text-white">
              Create Agent
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
