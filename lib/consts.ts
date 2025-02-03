import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  flowMainnet,
  flowTestnet,
} from "viem/chains";

export const BEAR_RED_HEX = "#E9171A";
export const BULL_GREEN_HEX = "#17E97D";

export type SupportedChains =
  | typeof baseSepolia
  | typeof arbitrumSepolia
  | typeof flowTestnet
  | typeof base
  | typeof arbitrum
  | typeof flowMainnet;
