/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
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
import { readContract } from "viem/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { coreAbi } from "@/lib/contract.types";
import { useAccount, usePublicClient, useWriteContract, useWalletClient } from "wagmi";
import { Database } from "@/lib/database.types";
import { formatEther } from "viem";
// import { wagmiConfig, walletClient } from "@/components/wrapper/wrapper";

// Helper function to generate a random hex color.
const generateRandomColor = (includeHash = false) => {
  const randomColor = Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0");
  return includeHash ? `#${randomColor}` : randomColor;
};

// Increase total steps to 7:
// 0: Method Selection, 1: Basic Info, 2: Platform, 3: Model Settings,
// 4: Character Card, 5: JSON Preview, 6: Confirmation.
const totalSteps = 7;

export default function CreateAgentModal() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [agentData, setAgentData] = useState({
    imageUrl: "",
    color: "",
    description: "",
    platform: "",
    endpoint: "",
    ethWalletAddress: "",
    characterCard: {
      name: "",
      bio: "",
      system: "",
      lore: "",
      knowledge: "",
      adjectives: "",
      messageExamples: "",
      postExamples: "",
      model: "gemini-2.0-flash-thinking-exp",
      modelProvider: "",
    },
  });
  const { address: userAddress } = useAccount();

  // New state to hold fees from the contract (assumed to be an array of BigInts)
  const [fees, setFees] = useState<any>(null);

  // Helper function to update platform and prepopulate the endpoint
  const updatePlatform = (platform: string) => {
    let endpoint = "";
    if (platform === "Local") {
      endpoint = "http://localhost:3000/eliza";
    } else if (platform === "Autonome") {
      endpoint = "https://autonome.example.com/user-uuid"; // Replace with actual URL
    } else if (platform === "Gaia") {
      endpoint = "https://gaia.example.com/user-uuid"; // Replace with actual URL
    }
    setAgentData({ ...agentData, platform, endpoint });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setAgentData({ ...agentData, [name]: value });
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

  // Update step titles for 7 steps.
  const getStepTitle = () => {
    const stepTitles = [
      "How do you want to create your agent?",
      "Basic Info – General",
      "Platform",
      "Model Settings",
      "Character Card",
      "Review JSON",
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

  // Fetch fees from the contract
  const getFees = async () => {
    if (!publicClient) {
      console.error("Public client not found");
      return null;
    }
    try {
      const result = await publicClient.readContract({
        abi: coreAbi,
        address: process.env.NEXT_PUBLIC_CORE_ADDRESS as `0x${string}`,
        functionName: "getFees",
      });
      return result;
    } catch (error) {
      console.error("Error fetching fees:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!publicClient) return;
    
    getFees()
      .then((result) => {
        setFees(result);
      })
      .catch((error) => console.error("Error in getFees useEffect:", error));
  }, [publicClient]); // Add publicClient to dependency array

  // In the agent flow, first perform the deposit call, then send a backend request.
  const handleSubmit = async () => {
    try {
      if (!publicClient) {
        throw new Error("Public client not available");
      }
      
      if (fees && userAddress && walletClient) {
        const { request } = await publicClient.simulateContract({
          abi: coreAbi,
          address: process.env.NEXT_PUBLIC_CORE_ADDRESS as `0x${string}`,
          functionName: "deposit",
          value: fees[0], // Assuming fees[0] is the deposit amount as BigInt
          account: userAddress,
        });
        
        if (!walletClient) {
          throw new Error("Wallet client not available");
        }

        const hash = await walletClient.writeContract(request);
        console.log("Deposit successful, hash:", hash);
      } else {
        throw new Error("Fees, user address, or wallet client not available");
      }
    } catch (error) {
      console.error("Error during deposit:", error);
      return; // Exit if deposit fails.
    }

    const payload: Database["public"]["Tables"]["agents"]["Insert"] = {
      display_name: agentData.characterCard.name,
      image_url: agentData.imageUrl,
      color: agentData.color,
      platform: agentData.platform,
      eth_wallet_address: agentData.ethWalletAddress,
      sol_wallet_address: "",
      single_sentence_summary: agentData.description,
      endpoint: agentData.endpoint,
      type: "basic",
      status: "Up",
      last_health_check: new Date().toISOString(),
      character_card: JSON.stringify(agentData.characterCard),
      earnings: 0,
      creator_id: 1,
      // Optionally include deposit transaction hash if needed:
      // deposit_transaction_hash: depositTxHash,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/agents`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Authorization-Signature": "mock_signature", // Replace with real signature if needed.
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("Failed to create agent");
      const data = await response.json();
      console.log("Agent created successfully:", data);
      setOpen(false);
      setStep(0);
      // Optionally refresh the page:
      // window.location.reload();
    } catch (error) {
      console.error("Error creating agent:", error);
    }
  };

  // Function to render JSON preview (Review JSON step)
  const renderJsonPreview = () => (
    <div className="space-y-4">
      <p className="text-gray-400">
        Review your agent configuration before confirming the creation.
      </p>
      <div className="bg-muted p-4 rounded-md text-sm max-w-2xl max-h-96 overflow-auto text-white">
        <pre className="whitespace-pre-wrap break-words">
          {JSON.stringify(agentData, null, 2)}
        </pre>
      </div>
    </div>
  );

  // Confirmation view (last step)
  const renderConfirmation = () => (
    <div className="flex flex-col gap-6">
      <div className="p-4 text-foreground rounded-lg border-2 border-gray-400 flex flex-col gap-2 text-center">
        <div className="text-muted-foreground">
          Creating this agent will cost
        </div>
        <div className="text-foreground text-xl">
          {fees ? formatEther(fees[1]) : "Loading..."} ETH
        </div>
        <div className="text-sm text-muted-foreground">
          2% of all fees generated will go to you.
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => alert("Download Personality not implemented yet.")}
              className="p-4 rounded-lg border-2 text-left border-gray-600 hover:border-primary"
            >
              <h3 className="font-semibold">Download Personality</h3>
              <p className="text-sm text-gray-400">
                Scrape personality using a link
              </p>
            </button>
            <button
              onClick={() => setStep(1)}
              className="p-4 rounded-lg border-2 text-left border-gray-600 hover:border-primary"
            >
              <h3 className="font-semibold">Create Manually</h3>
              <p className="text-sm text-gray-400">
                Create your agent manually
              </p>
            </button>
            <button
              onClick={() => alert("Upload Character not implemented yet.")}
              className="p-4 rounded-lg border-2 text-left border-gray-600 hover:border-primary"
            >
              <h3 className="font-semibold">Upload Character</h3>
              <p className="text-sm text-gray-400">
                Upload your JSON to create an agent
              </p>
            </button>
          </div>
        );
      case 1:
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Agent Name</Label>
              <Input
                name="name"
                value={agentData.characterCard.name}
                onChange={handleCharacterCardChange}
                placeholder="Agent Name"
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
              <Label>Description</Label>
              <Input
                name="description"
                value={agentData.description}
                onChange={handleChange}
                placeholder="A short description..."
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Eth Wallet Address</Label>
              <Input
                name="ethWalletAddress"
                value={agentData.ethWalletAddress}
                onChange={handleChange}
                placeholder="0x..."
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
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select
                value={agentData.platform}
                onValueChange={(value) => updatePlatform(value)}
              >
                <SelectTrigger className="bg-muted">
                  <SelectValue placeholder="Select Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Local">Local</SelectItem>
                  <SelectItem value="Autonome">Autonome</SelectItem>
                  <SelectItem value="Gaia">Gaia</SelectItem>
                </SelectContent>
              </Select>
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
          </div>
        );
      case 3:
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Model Provider</Label>
              <Select
                value={agentData.characterCard.modelProvider}
                onValueChange={(value) =>
                  setAgentData({
                    ...agentData,
                    characterCard: {
                      ...agentData.characterCard,
                      modelProvider: value,
                    },
                  })
                }
              >
                <SelectTrigger className="bg-muted">
                  <SelectValue placeholder="Select model provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">openai</SelectItem>
                  <SelectItem value="anthropic">anthropic</SelectItem>
                  <SelectItem value="openrouter">openrouter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Model</Label>
              <Input
                name="model"
                value={agentData.characterCard.model}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col gap-4 overflow-y-auto max-h-[30rem] pr-2 scroll-thin">
            <div className="space-y-2">
              <Label>System Behavior</Label>
              <Textarea
                name="system"
                value={agentData.characterCard.system}
                onChange={handleCharacterCardChange}
                placeholder="System Behavior"
                className="bg-muted"
              />
            </div>
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
              <Label>Adjectives</Label>
              <Textarea
                name="adjectives"
                value={agentData.characterCard.adjectives}
                onChange={handleCharacterCardChange}
                placeholder="Adjectives"
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Message Examples</Label>
              <Textarea
                name="messageExamples"
                value={agentData.characterCard.messageExamples}
                onChange={handleCharacterCardChange}
                placeholder="Message examples"
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Post Examples</Label>
              <Textarea
                name="postExamples"
                value={agentData.characterCard.postExamples}
                onChange={handleCharacterCardChange}
                placeholder="Post examples"
                className="bg-muted"
              />
            </div>
          </div>
        );
      case 5:
        return renderJsonPreview();
      case 6:
        return renderConfirmation();
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="px-4 py-2 h-10 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
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
