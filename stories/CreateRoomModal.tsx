import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ColorPicker } from "@/components/ui/color-picker";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import supabase from "@/lib/config";
import { Tables } from "@/lib/database.types";
import { cn, generateRandomColor, getChainMetadata } from "@/lib/utils";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { getTokens } from "@coinbase/onchainkit/api";
import { Token, TokenImage } from "@coinbase/onchainkit/token";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  flowMainnet,
  flowTestnet,
} from "viem/chains";
import { AgentAvatar } from "./AgentAvatar";
import arbitrumIcon from "./assets/crypto/arbitrum-full-primary.svg";
import baseIcon from "./assets/crypto/base-full-white.svg";
import flowIcon from "./assets/crypto/flow-full-white.svg";
import solanaIcon from "./assets/crypto/solana-full-color.svg";
import { ChainButton } from "./ChainButton";
import { PvPRuleCard } from "./PvPRuleCard";
import { SupportedChains } from "@/lib/consts";
import { readContract } from "viem/actions";
import { coreAbi } from "@/lib/contract.types";
import { wagmiConfig, walletClient } from "@/components/wrapper/wrapper";
import { formatEther } from "viem";
import { useAccount } from "wagmi";

type PvPRule =
  | "SILENCE"
  | "DEAFEN"
  | "ATTACK"
  | "OVERLOAD"
  | "POISON"
  | "BLIND"
  | "AMNESIA"
  | "DECEIVE"
  | "CONFUSE"
  | "MIND_CONTROL"
  | "FRENZY"
  | "CHAOS";

interface RoomSettings {
  name: string;
  image_url: string;
  color: string;
  round_time: number;
}

interface CreateRoomState {
  step: number;
  roomType?: number;
  selectedAgents: number[];
  chain?: SupportedChains;
  settings?: RoomSettings;
  tokenInfo?: Token;
  pvpEnabled: boolean;
  pvpRules: PvPRule[];
}

interface CreateRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialState?: CreateRoomState;
}

export function CreateRoomModal({
  open,
  onOpenChange,
  initialState,
}: CreateRoomModalProps) {
  const [createRoomFormState, setCreateRoomFormState] =
    useState<CreateRoomState>(
      initialState || {
        step: 2,
        pvpEnabled: true,
        pvpRules: [
          "SILENCE",
          "DEAFEN",
          "ATTACK",
          "OVERLOAD",
          "POISON",
          "BLIND",
          "AMNESIA",
          "DECEIVE",
          "CONFUSE",
          "MIND_CONTROL",
          "FRENZY",
          "CHAOS",
        ],
        selectedAgents: [],
      }
    );

  const [roomTypes, setRoomTypes] = useState<Tables<"room_types">[]>([]);
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(true);
  const [agents, setAgents] = useState<Tables<"agents">[]>([]);
  const [searchAgentQuery, setSearchAgentQuery] = useState("");
  const [tokenSearchQuery, setTokenSearchQuery] = useState("");
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [chain, setChain] = useState<SupportedChains>(base);
  const [settings, setSettings] = useState<RoomSettings>(
    createRoomFormState.settings || {
      name: "",
      image_url: "",
      color: generateRandomColor(true),
      round_time: 300,
    }
  );
  const [tokenInfo, setTokenInfo] = useState<Token | undefined>();
  const [tokenSearchResults, setTokenSearchResults] = useState<Token[]>([]);
  const [loadingToken, setLoadingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string>();
  const { address: userAddress } = useAccount();
  // New state to hold fees from the contract
  const [fees, setFees] = useState<any>(null);

  const handleSettingsChange = (updates: Partial<RoomSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    setCreateRoomFormState((s) => ({ ...s, settings: newSettings }));
  };

  // Fetch room types
  useEffect(() => {
    supabase
      .from("room_types")
      .select("*")
      .order("id")
      .then(({ data, error }) => {
        if (!error) {
          setRoomTypes(data || []);
          setLoadingRoomTypes(false);
        }
      });
  }, []);

  // Fetch agents
  useEffect(() => {
    supabase
      .from("agents")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error) {
          setAgents(data || []);
          setLoadingAgents(false);
        }
      });
  }, []);

  // Load token info
  useEffect(() => {
    const loadTokenInfo = async (address: string) => {
      if (address) {
        try {
          setLoadingToken(true);
          const tokens = await getTokens({ limit: "50", search: address });
          if ("message" in tokens) {
            setTokenError(tokens.message);
          } else {
            setTokenSearchResults(tokens);
            setTokenError(tokens.length === 0 ? "Token not found" : undefined);
          }
          setLoadingToken(false);
        } catch (error: any) {
          setTokenError("Failed to load token information: " + error);
        }
      }
    };
    loadTokenInfo(tokenSearchQuery);
  }, [tokenSearchQuery]);

  // Fetch fees from the contract
  const getFees = async () => {
    try {
      const result = await readContract(wagmiConfig, {
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
    getFees()
      .then((result) => {
        setFees(result);
      })
      .catch((error) => console.error("Error in getFees useEffect:", error));
  }, []);

  const handleCreateRoom = async () => {
    if (!createRoomFormState.settings) return;
    const chainMeta = getChainMetadata(chain.id);
    const roundEndsOn = new Date(
      Date.now() + createRoomFormState.settings.round_time * 1000
    ).toISOString();

    // First, perform the deposit call on the contract
    let transactionHash: string | null = null;
    try {
      if (fees && userAddress) {
        const { request } = await wagmiConfig.simulateContract({
          abi: coreAbi,
          address: coreAddress,
          functionName: "deposit",
          value: fees[1],
          account: userAddress,
        });

        const depositTx = await walletClient.writeContract(request);
        console.log("Deposit successful:", depositTx);
        transactionHash = depositTx;
      } else {
        throw new Error("Fees or user address not loaded");
      }
    } catch (error) {
      console.error("Error during deposit:", error);
      return; // Exit if deposit fails.
    }

    const payload = {
      name: createRoomFormState.settings.name,
      room_type: createRoomFormState.roomType === 1 ? "buy_sell" : "chat",
      image_url: createRoomFormState.settings.image_url?.startsWith("http")
        ? createRoomFormState.settings.image_url
        : "https://example.com/default-room.png",
      color: createRoomFormState.settings.color,
      chain_id: String(chain.id),
      chain_family: chainMeta.family,
      contract_address: "0x1234...", // Replace with actual contract address if needed.
      round_time: createRoomFormState.settings.round_time,
      room_config: {
        round_duration: createRoomFormState.settings.round_time,
        round_ends_on: roundEndsOn,
        pvp_config: {
          enabled: createRoomFormState.pvpEnabled,
          allowed_functions: createRoomFormState.pvpRules,
          enabled_rules: createRoomFormState.pvpRules,
        },
        features: {
          public_chat: true,
        },
      },
      token: tokenInfo?.address || "0x0000000000000000000000000000000000000000",
      token_webhook: "https://example.com/webhook",
      agents: {
        default: {
          wallet: "0x0000000000000000000000000000000000000000",
          webhook: "https://example.com/agent-webhook",
        },
      },
      gm: "0x0000000000000000000000000000000000000000",
      // Pass the transaction hash from the deposit call
      transaction_hash: transactionHash,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/rooms/setup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Authorization-Signature": "mock_signature", // Replace with real signature if needed.
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("Failed to create room");
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const renderStepContent = () => {
    switch (createRoomFormState.step) {
      case 2:
        return renderRoomTypeSelection();
      case 3:
        return renderChainSelection();
      case 4:
        return renderAgentSelection();
      case 5:
        return renderRoomSettings();
      case 6:
        return renderTypeSpecificSettings();
      case 7:
        return renderPvPSettings();
      case 8:
        return renderConfirmation();
      default:
        return null;
    }
  };

  const renderRoomTypeSelection = () => {
    if (loadingRoomTypes) {
      return (
        <div className="flex items-center justify-center h-40 text-muted-foreground">
          Loading room types...
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 gap-4">
        {roomTypes.map((type) => (
          <button
            key={type.id}
            className={`p-4 rounded-lg border-2 text-left ${
              createRoomFormState.roomType === type.id
                ? "border-primary"
                : "border-gray-600"
            }`}
            onClick={() =>
              setCreateRoomFormState((s) => ({
                ...s,
                roomType: type.id,
                step: s.step + 1,
              }))
            }
          >
            <h3 className="font-semibold">{type.name}</h3>
            <p className="text-sm text-gray-400">{type.description}</p>
          </button>
        ))}
      </div>
    );
  };

  const renderChainSelection = () => (
    <div>
      <div className="font-medium text-green-300">Testnet</div>
      <div className="grid grid-cols-2 gap-4">
        <ChainButton
          iconUrl={baseIcon.src}
          selected={chain.id === baseSepolia.id}
          className="bg-[#0052FF] w-full h-[60px]"
          iconClassName="w-[160px] h-[40px]"
          onClick={() => setChain(baseSepolia)}
        />
        <ChainButton
          disabled={true}
          iconUrl={arbitrumIcon.src}
          selected={chain.id === arbitrumSepolia.id}
          className="bg-[#28A0F0] w-full h-[60px]"
          iconClassName="w-[160px] h-[40px]"
          onClick={() => setChain(arbitrumSepolia)}
        />
        <ChainButton
          disabled={true}
          iconUrl={flowIcon.src}
          selected={chain.id === flowTestnet.id}
          className="bg-[#00EF8B] w-full h-[60px]"
          iconClassName="w-[160px] h-[40px]"
          onClick={() => setChain(flowTestnet)}
        />
        <ChainButton
          disabled={true}
          iconUrl={solanaIcon.src}
          selected={false}
          className="bg-[#512DA8] w-full h-[60px] opacity-50 cursor-not-allowed"
          iconClassName="w-[160px] h-[40px]"
        />
      </div>
      <div className="font-medium text-red-300">Mainnet</div>
      <div className="grid grid-cols-2 gap-4">
        <ChainButton
          iconUrl={baseIcon.src}
          selected={chain.id === base.id}
          className="bg-[#0052FF] w-full h-[60px]"
          iconClassName="w-[160px] h-[40px]"
          onClick={() => setChain(base)}
        />
        <ChainButton
          disabled={true}
          iconUrl={arbitrumIcon.src}
          selected={chain.id === arbitrum.id}
          className="bg-[#28A0F0] w-full h-[60px]"
          iconClassName="w-[160px] h-[40px]"
          onClick={() => setChain(base)}
        />
        <ChainButton
          disabled={true}
          iconUrl={flowIcon.src}
          selected={chain.id === flowMainnet.id}
          className="bg-[#00EF8B] w-full h-[60px]"
          iconClassName="w-[160px] h-[40px]"
          onClick={() => setChain(flowMainnet)}
        />
        <ChainButton
          disabled={true}
          iconUrl={solanaIcon.src}
          selected={false}
          className="bg-[#512DA8] w-full h-[60px] opacity-50 cursor-not-allowed"
          iconClassName="w-[160px] h-[40px]"
        />
      </div>
    </div>
  );

  const renderAgentSelection = () => {
    const filteredAgents = agents.filter((agent) =>
      agent.display_name?.toLowerCase().includes(searchAgentQuery.toLowerCase())
    );
    const toggleAgent = (agentId: number) => {
      setCreateRoomFormState((s) => {
        const newSelectedAgents = s.selectedAgents.includes(agentId)
          ? s.selectedAgents.filter((id) => id !== agentId)
          : s.selectedAgents.length < 5
          ? [...s.selectedAgents, agentId]
          : s.selectedAgents;
        return { ...s, selectedAgents: newSelectedAgents };
      });
    };

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between h-[64px] bg-muted rounded-lg">
          <div className="flex gap-2 p-2 overflow-x-auto">
            {createRoomFormState.selectedAgents.map((agentId) => {
              const agent = agents.find((a) => a.id === agentId);
              if (!agent) return null;
              return (
                <div
                  key={agent.id}
                  className="relative group flex-shrink-0"
                  onClick={() => toggleAgent(agent.id)}
                >
                  <AgentAvatar
                    name={agent.display_name || ""}
                    imageUrl={agent.image_url || ""}
                    borderColor={agent.color || "#000000"}
                    variant="sm"
                    className="cursor-pointer hover:opacity-75"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="text-xs text-white bg-black/50 px-1 rounded">
                      Remove
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <span className="text-sm text-gray-400 px-4">
            {createRoomFormState.selectedAgents.length}/5 selected
          </span>
        </div>
        <Input
          placeholder="Search agents..."
          value={searchAgentQuery}
          onChange={(e) => setSearchAgentQuery(e.target.value)}
          className="bg-muted border-border"
        />
        <ScrollArea className="h-[400px] rounded-md border border-border">
          <div className="p-4">
            {loadingAgents ? (
              <div className="text-center text-gray-400">Loading agents...</div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      createRoomFormState.selectedAgents.includes(agent.id)
                        ? "bg-primary/20"
                        : "hover:bg-gray-800"
                    }`}
                    onClick={() => toggleAgent(agent.id)}
                  >
                    <div className="flex items-center gap-3">
                      <AgentAvatar
                        name={agent.display_name || ""}
                        imageUrl={agent.image_url || ""}
                        borderColor={agent.color || "#000000"}
                        variant="sm"
                      />
                      <span className="font-medium">{agent.display_name}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {agent.eth_wallet_address?.slice(0, 6)}...
                      {agent.eth_wallet_address?.slice(-4)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const renderRoomSettings = () => {
    const roundTimeOptions = [
      { label: "1m", value: 60 },
      { label: "3m", value: 180 },
      { label: "5m", value: 300 },
      { label: "10m", value: 600 },
      { label: "15m", value: 900 },
    ];

    return (
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Room Name</Label>
          <Input
            id="name"
            value={settings.name}
            onChange={(e) => handleSettingsChange({ name: e.target.value })}
            placeholder="Enter room name"
            className="bg-muted border-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="image_url">Room Image URL</Label>
          <Input
            id="image_url"
            value={settings.image_url}
            onChange={(e) =>
              handleSettingsChange({ image_url: e.target.value })
            }
            placeholder="Enter room image URL"
            className="bg-muted border-border"
          />
        </div>
        <ColorPicker
          label="Room Color"
          value={settings.color}
          onChange={(color) => handleSettingsChange({ color })}
          generateRandomColor={() =>
            handleSettingsChange({ color: generateRandomColor(true) })
          }
        />
        <div className="space-y-2">
          <Label>Round Time</Label>
          <div className="flex gap-2">
            {roundTimeOptions.map(({ label, value }) => (
              <button
                key={value}
                className={`px-4 py-2 rounded ${
                  settings.round_time === value
                    ? "bg-primary text-primary-foreground"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
                onClick={() => handleSettingsChange({ round_time: value })}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTypeSpecificSettings = () => {
    if (createRoomFormState.roomType === 3) {
      return (
        <div className="flex flex-col gap-6">
          <p className="text-gray-400">{`No settings for "Just Chat".`}</p>
        </div>
      );
    }
    if (
      createRoomFormState.roomType === 1 ||
      createRoomFormState.roomType === 2
    ) {
      return (
        <OnchainKitProvider
          chain={chain}
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
        >
          <div className="flex flex-col gap-6">
            {tokenInfo ? (
              <div className="w-4/6 mx-auto">
                <div className="flex justify-center items-stretch gap-4 py-4 px-3 border-2 border-gray-400 rounded-lg">
                  <div className="flex items-center">
                    <TokenImage token={tokenInfo} size={64} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold">${tokenInfo.symbol}</span>
                    <span className="text-md text-muted-foreground">
                      {tokenInfo.name}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {tokenInfo.address}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-sm mx-auto">
                <div className="flex items-stretch gap-4 py-4 px-3 border-2 border-gray-400 rounded-lg">
                  <div className="w-10 h-10 rounded-full border-2 border-dashed border-muted-foreground" />
                  <div className="flex flex-col gap-1.5">
                    <div className="w-20 h-5 rounded border-2 border-dashed border-muted-foreground" />
                    <div className="w-32 h-4 rounded border-2 border-dashed border-muted-foreground" />
                    <div className="w-40 h-4 rounded border-2 border-dashed border-muted-foreground" />
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Input
                id="tokenAddress"
                value={tokenSearchQuery}
                onChange={(e) => setTokenSearchQuery(e.target.value)}
                placeholder="Search by address or token name..."
                className="bg-muted border-border"
              />
              {loadingToken && (
                <div className="text-sm text-gray-400">Loading...</div>
              )}
            </div>
            {tokenError && (
              <p className="text-sm text-destructive mt-1">{tokenError}</p>
            )}
            {tokenSearchResults.length > 0 && (
              <ScrollArea className="h-[250px] rounded-md border border-border">
                <div className="p-2 space-y-2">
                  {tokenSearchResults.map((token) => (
                    <div
                      key={token.address}
                      className="flex items-start justify-between p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => setTokenInfo(token)}
                    >
                      <div className="flex items-start gap-4">
                        <TokenImage token={token} size={40} />
                        <div className="flex flex-col">
                          <span className="font-bold text-lg">
                            ${token.symbol}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {token.name}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground text-right">
                        {token.address}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </OnchainKitProvider>
      );
    }
    return null;
  };

  const renderPvPSettings = () => {
    const togglePvPRule = (rule: PvPRule) => {
      setCreateRoomFormState((s) => ({
        ...s,
        pvpRules: s.pvpRules.includes(rule)
          ? s.pvpRules.filter((r) => r !== rule)
          : [...s.pvpRules, rule],
      }));
    };

    const lowImpactRules: PvPRule[] = [
      "SILENCE",
      "DEAFEN",
      "ATTACK",
      "OVERLOAD",
    ];
    const moderateImpactRules: PvPRule[] = ["POISON", "BLIND", "AMNESIA"];
    const highImpactRules: PvPRule[] = ["DECEIVE", "CONFUSE", "MIND_CONTROL"];

    return (
      <div className="flex flex-col gap-6">
        <div className="flex justify-center">
          <div
            className={cn(
              "flex items-center gap-3 px-8 py-2 rounded-lg border-2 transition-all",
              createRoomFormState.pvpEnabled
                ? "bg-primary/20 border-primary"
                : "border-gray-700"
            )}
          >
            <Checkbox
              id="pvp-enabled"
              checked={createRoomFormState.pvpEnabled}
              onCheckedChange={(checked) =>
                setCreateRoomFormState((s) => ({
                  ...s,
                  pvpEnabled: checked as boolean,
                }))
              }
            />
            <Label
              htmlFor="pvp-enabled"
              className="text-lg font-medium cursor-pointer"
            >
              Enable PvP
            </Label>
          </div>
        </div>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4 p-4">
            <h3 className="text-lg font-medium text-gray-300">
              Low Impact Rules
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {lowImpactRules.map((rule) => (
                <PvPRuleCard
                  key={rule}
                  variant={rule}
                  selected={createRoomFormState.pvpRules.includes(rule)}
                  className={
                    !createRoomFormState.pvpEnabled
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }
                  onClick={() =>
                    createRoomFormState.pvpEnabled && togglePvPRule(rule)
                  }
                />
              ))}
            </div>
          </div>
          <div className="space-y-4 mt-8 p-4">
            <h3 className="text-lg font-medium text-gray-300">
              Moderate Impact Rules
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {moderateImpactRules.map((rule) => (
                <PvPRuleCard
                  key={rule}
                  variant={rule}
                  selected={createRoomFormState.pvpRules.includes(rule)}
                  className={
                    !createRoomFormState.pvpEnabled
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }
                  onClick={() =>
                    createRoomFormState.pvpEnabled && togglePvPRule(rule)
                  }
                />
              ))}
            </div>
          </div>
          <div className="space-y-4 mt-8 p-4">
            <h3 className="text-lg font-medium text-gray-300">
              High Impact Rules
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {highImpactRules.map((rule) => (
                <PvPRuleCard
                  key={rule}
                  variant={rule}
                  selected={createRoomFormState.pvpRules.includes(rule)}
                  className={
                    !createRoomFormState.pvpEnabled
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }
                  onClick={() =>
                    createRoomFormState.pvpEnabled && togglePvPRule(rule)
                  }
                />
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  };

  // Updated confirmation render to display fees
  const renderConfirmation = () => (
    <div className="flex flex-col gap-6">
      <div className="p-4 text-foreground rounded-lg border-2 border-gray-400 flex flex-col gap-2 text-center">
        <div className="text-muted-foreground">
          Creating this room will cost
        </div>
        <div className="text-foreground text-xl">
          {fees ? formatEther(fees[1]) : "Loading..."}{" "}
          {chain.nativeCurrency.symbol}
        </div>
        <div className="text-sm text-muted-foreground">
          2% of all fees generated in room will go to you
        </div>
      </div>
    </div>
  );

  const canProceedToNextStep = () => {
    switch (createRoomFormState.step) {
      case 2:
        return !!createRoomFormState.roomType;
      case 3:
        return !!chain;
      case 4:
        return createRoomFormState.selectedAgents.length > 0;
      case 5:
        if (
          createRoomFormState.roomType === 3 ||
          createRoomFormState.roomType === 4
        )
          return true;
        return !!(settings.name && settings.image_url);
      case 6:
        if (
          createRoomFormState.roomType === 3 ||
          createRoomFormState.roomType === 4
        )
          return true;
        return !!tokenInfo;
      case 7:
        return true;
      default:
        return true;
    }
  };

  const getStepTitle = () => {
    let stepName = "";
    switch (createRoomFormState.step) {
      case 2:
        stepName = "Select Room Type";
        break;
      case 3:
        stepName = "Select Chain";
        break;
      case 4:
        stepName = "Select Agents";
        break;
      case 5:
        stepName = "Room Settings";
        break;
      case 6:
        stepName =
          createRoomFormState.roomType === 3
            ? "Chat Room Settings"
            : createRoomFormState.roomType === 1
            ? "Buy/Sell Room Settings"
            : createRoomFormState.roomType === 2
            ? "Long/Short Room Settings"
            : "Room Configuration";
        break;
      case 7:
        stepName = "PvP Settings";
        break;
      case 8:
        stepName = "Confirm Room Creation";
        break;
      default:
        stepName = "";
    }
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i < createRoomFormState.step - 2 ? "bg-primary" : "bg-secondary"
              }`}
            />
          ))}
        </div>
        <h2>{stepName}</h2>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[700px] bg-background text-foreground border-border">
        <DialogTitle className="text-2xl font-semibold">
          {getStepTitle()}
        </DialogTitle>
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6">
            {renderStepContent()}
          </div>
          <div className="flex justify-between p-6 border-t border-border bg-background">
            <button
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() =>
                setCreateRoomFormState((s) => ({ ...s, step: s.step - 1 }))
              }
              disabled={createRoomFormState.step <= 2}
            >
              Back
            </button>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={
                createRoomFormState.step === 8
                  ? handleCreateRoom
                  : () =>
                      setCreateRoomFormState((s) => ({
                        ...s,
                        step: s.step + 1,
                      }))
              }
              disabled={!canProceedToNextStep()}
            >
              {createRoomFormState.step === 8 ? "Create Room" : "Next"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
