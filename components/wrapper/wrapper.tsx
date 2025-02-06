"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/stories/Navbar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { createPublicClient, custom, createWalletClient, http } from "viem";
import { baseSepolia } from "viem/chains";

export const wagmiConfig = createPublicClient({
  chain: baseSepolia,
  transport: http(
    `https://base-sepolia.g.alchemy.com/v2/wY-X7zwF8AcHhyx5r7bN24reZkc_E2Pd`
  ),
});

export const walletClient = createWalletClient({
  chain: baseSepolia,
  transport: custom(window.ethereum),
});

export const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: `${process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID}`,
  chains: [baseSepolia],
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
            <ReactQueryDevtools initialIsOpen={false} />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}
