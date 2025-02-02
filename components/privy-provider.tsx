"use client";

import { BULL_GREEN_HEX } from "@/lib/consts";
import { PrivyProvider } from "@privy-io/react-auth";
import { FC } from "react";

const Providers: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <PrivyProvider
      appId="cm6cs9nre0009qozam07vfpyj"
      config={{
        // Customize Privy's appearance in your app
        appearance: {
          theme: "dark",
          accentColor: BULL_GREEN_HEX,
          logo: "hhttps://raw.githubusercontent.com/base-org/brand-kit/a3b352afcc0839a0a355ccc2ae3279442fa56343/logo/symbol/Base_Symbol_White.png", //TODO replace with our logo
        },
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
};

export default Providers;
