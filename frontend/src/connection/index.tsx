"use client";

import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { createConfig, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import { mantleSepoliaTestnet } from "viem/chains";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { ZeroDevSmartWalletConnectors } from "@dynamic-labs/ethereum-aa";
export const createWagmiConfig = () =>
  createConfig({
    chains: [mantleSepoliaTestnet],
    multiInjectedProviderDiscovery: false,
    transports: {
      [mantleSepoliaTestnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
    },
  });

export const createQueryClient = () => new QueryClient();

export const AppWagmiProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const config = createWagmiConfig();
  const queryClient = createQueryClient();
  return (
    <DynamicContextProvider
      settings={{
        environmentId:
          process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID ||
          process.env.NEXT_PUBLIC_DYNAMIC_ENVIROMENT_ID ||
          "",
        walletConnectors: [
          EthereumWalletConnectors,
          ZeroDevSmartWalletConnectors,
        ],
        events: {
          onLogout: () => {
            window.location.href = "/explore";
          },
        },
        policiesConsentInnerComponent: "Agree to Terms & Conditions and Privacy Policy to continue",
        privacyPolicyUrl: "https://www.hostit.events/privacy-policy",
        termsOfServiceUrl: "https://www.hostit.events/terms-of-service",
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
};
