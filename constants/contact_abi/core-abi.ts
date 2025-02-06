export const coreAddress = "0xBe974Fc0E88fC9fF90C9E1C5fF8FA57D819e2284";

export const coreAbi = [
  {
    type: "constructor",
    inputs: [{ name: "usdc", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  { type: "fallback", stateMutability: "nonpayable" },
  { type: "receive", stateMutability: "payable" },
  {
    type: "function",
    inputs: [],
    name: "BASIS_POINTS",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "MAX_FEE_RATE",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "USDC",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "agentId", internalType: "uint256", type: "uint256" },
      { name: "isactive", internalType: "bool", type: "bool" },
    ],
    name: "UpdateAgent",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "agentWallets",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "agents",
    outputs: [
      { name: "creator", internalType: "address", type: "address" },
      { name: "isActive", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "balances",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creator", internalType: "address", type: "address" },
      { name: "agentId", internalType: "uint256", type: "uint256" },
    ],
    name: "createAgent",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "gameMaster", internalType: "address", type: "address" },
      { name: "creator", internalType: "address", type: "address" },
      { name: "tokenAddress", internalType: "address", type: "address" },
      {
        name: "roomAgentWallets",
        internalType: "address[]",
        type: "address[]",
      },
      { name: "diamond", internalType: "address", type: "address" },
    ],
    name: "createRoom",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [],
    name: "dao",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [],
    name: "fees",
    outputs: [
      { name: "agentCreationFee", internalType: "uint256", type: "uint256" },
      { name: "roomCreationFee", internalType: "uint256", type: "uint256" },
      { name: "roomCreatorCut", internalType: "uint256", type: "uint256" },
      { name: "agentCreatorCut", internalType: "uint256", type: "uint256" },
      { name: "daoCut", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "agentId", internalType: "uint256", type: "uint256" }],
    name: "getAgent",
    outputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "bool", type: "bool" },
      { name: "", internalType: "address[]", type: "address[]" },
      { name: "", internalType: "address[]", type: "address[]" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "wallet", internalType: "address", type: "address" }],
    name: "getAgentByWallet",
    outputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "bool", type: "bool" },
      { name: "", internalType: "address", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "user", internalType: "address", type: "address" }],
    name: "getBalance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getFees",
    outputs: [
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "roomAddress", internalType: "address", type: "address" }],
    name: "getRoom",
    outputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "maxAgentsPerRoom",
    outputs: [{ name: "", internalType: "uint32", type: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "agentId", internalType: "uint256", type: "uint256" },
      { name: "altWallet", internalType: "address", type: "address" },
    ],
    name: "registerAgentWallet",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "roomImplementation",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "rooms",
    outputs: [
      { name: "token", internalType: "address", type: "address" },
      { name: "creator", internalType: "address", type: "address" },
      { name: "isActive", internalType: "bool", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "daoAddress", internalType: "address", type: "address" }],
    name: "setDao",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "roomcreationFee", internalType: "uint256", type: "uint256" },
      { name: "agentcreationFee", internalType: "uint256", type: "uint256" },
      { name: "roomcreatorCut", internalType: "uint256", type: "uint256" },
      { name: "agentcreatorCut", internalType: "uint256", type: "uint256" },
      { name: "daocut", internalType: "uint256", type: "uint256" },
    ],
    name: "setFee",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "implementation", internalType: "address", type: "address" },
    ],
    name: "setRoomImplementation",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "roomAddress", internalType: "address", type: "address" },
      { name: "isactive", internalType: "bool", type: "bool" },
      { name: "newCreator", internalType: "address", type: "address" },
    ],
    name: "updateRoom",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "withdrawBalance",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "agentId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "creator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AgentCreated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "agentId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "creator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "isActive", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "AgentUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "agentId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "newWallet",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "AgentWalletsUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "user", internalType: "address", type: "address", indexed: true },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "BalanceDeposited",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "user", internalType: "address", type: "address", indexed: true },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "BalanceWithdrawn",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "roomCreationFee",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "agentCreationFee",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "roomCreatorCut",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "agentCreatorCut",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "daoCut",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "FeesSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "previousOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "newOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "OwnershipTransferred",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "roomAddress",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "creator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "RoomCreated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "roomAddress",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "creator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "isActive", internalType: "bool", type: "bool", indexed: true },
    ],
    name: "RoomUpdated",
  },
  {
    type: "error",
    inputs: [{ name: "agentId", internalType: "uint256", type: "uint256" }],
    name: "Core__AgentAlreadyExists",
  },
  { type: "error", inputs: [], name: "Core__AgentAltWalletAlreadyExists" },
  {
    type: "error",
    inputs: [{ name: "agentId", internalType: "uint256", type: "uint256" }],
    name: "Core__AgentDoesNotExist",
  },
  {
    type: "error",
    inputs: [{ name: "agentId", internalType: "uint256", type: "uint256" }],
    name: "Core__AgentNotActive",
  },
  {
    type: "error",
    inputs: [
      { name: "queriedWallet", internalType: "address", type: "address" },
    ],
    name: "Core__AgentWalletNotFound",
  },
  { type: "error", inputs: [], name: "Core__CreateRoomInvalidToken" },
  { type: "error", inputs: [], name: "Core__CreateRoomUnathorized" },
  { type: "error", inputs: [], name: "Core__FeeZero" },
  { type: "error", inputs: [], name: "Core__IncorrectAgentCreationFee" },
  { type: "error", inputs: [], name: "Core__IncorrectRoomCreationFee" },
  { type: "error", inputs: [], name: "Core__InsufficientBalance" },
  { type: "error", inputs: [], name: "Core__InvalidCreator" },
  { type: "error", inputs: [], name: "Core__InvalidCutPoints" },
  { type: "error", inputs: [], name: "Core__InvalidCutRate" },
  { type: "error", inputs: [], name: "Core__InvalidRoomAgents" },
  { type: "error", inputs: [], name: "Core__RoomImplementationNotSet" },
  { type: "error", inputs: [], name: "Core__UnauthorizedAccessofAgent" },
  { type: "error", inputs: [], name: "Core__UnauthorizedAccessofRoom" },
  { type: "error", inputs: [], name: "FailedDeployment" },
  {
    type: "error",
    inputs: [
      { name: "balance", internalType: "uint256", type: "uint256" },
      { name: "needed", internalType: "uint256", type: "uint256" },
    ],
    name: "InsufficientBalance",
  },
  {
    type: "error",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "OwnableInvalidOwner",
  },
  {
    type: "error",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "OwnableUnauthorizedAccount",
  },
  { type: "error", inputs: [], name: "ReentrancyGuardReentrantCall" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Create2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const create2Abi = [
  { type: "error", inputs: [], name: "Create2EmptyBytecode" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Diamond
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const diamondAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  { type: "fallback", stateMutability: "payable" },
  { type: "receive", stateMutability: "payable" },
  {
    type: "function",
    inputs: [
      { name: "_facetAddress", internalType: "address", type: "address" },
      {
        name: "_functionSelectors",
        internalType: "bytes4[]",
        type: "bytes4[]",
      },
    ],
    name: "addFacet",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "facetAddress",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "selectors",
        internalType: "bytes4[]",
        type: "bytes4[]",
        indexed: false,
      },
    ],
    name: "DiamondCut",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "previousOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "newOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "OwnershipTransferred",
  },
  {
    type: "error",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "OwnableInvalidOwner",
  },
  {
    type: "error",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "OwnableUnauthorizedAccount",
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20Abi = [
  {
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "spender", internalType: "address", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "spender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Approval",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "from", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Transfer",
  },
  {
    type: "error",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "allowance", internalType: "uint256", type: "uint256" },
      { name: "needed", internalType: "uint256", type: "uint256" },
    ],
    name: "ERC20InsufficientAllowance",
  },
  {
    type: "error",
    inputs: [
      { name: "sender", internalType: "address", type: "address" },
      { name: "balance", internalType: "uint256", type: "uint256" },
      { name: "needed", internalType: "uint256", type: "uint256" },
    ],
    name: "ERC20InsufficientBalance",
  },
  {
    type: "error",
    inputs: [{ name: "approver", internalType: "address", type: "address" }],
    name: "ERC20InvalidApprover",
  },
  {
    type: "error",
    inputs: [{ name: "receiver", internalType: "address", type: "address" }],
    name: "ERC20InvalidReceiver",
  },
  {
    type: "error",
    inputs: [{ name: "sender", internalType: "address", type: "address" }],
    name: "ERC20InvalidSender",
  },
  {
    type: "error",
    inputs: [{ name: "spender", internalType: "address", type: "address" }],
    name: "ERC20InvalidSpender",
  },
] as const;
