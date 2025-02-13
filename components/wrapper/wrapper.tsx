"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/stories/Navbar";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createPublicClient, createWalletClient, custom } from "viem";
import { arbitrumSepolia, baseSepolia } from "viem/chains";
import { http, WagmiProvider } from "wagmi";

export const wagmiConfig = createPublicClient({
  chain: baseSepolia,
  transport: http(`${process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL}`),
});

// NEW: Move wallet client creation inside a useEffect to avoid SSR issues
export let walletClient: ReturnType<typeof createWalletClient> | undefined;

if (typeof window !== 'undefined') {
  walletClient = createWalletClient({
    chain: baseSepolia,
    transport: custom(window.ethereum),
  });
}

export const config = getDefaultConfig({
  appName: "PvPvAI",
  projectId: `${process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID}`,
  chains: [baseSepolia, arbitrumSepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();
export default function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <Toaster />
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Navbar />
              {children}
            </ThemeProvider>
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}
