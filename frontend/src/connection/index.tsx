"use client";

import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { createConfig, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import { mantleSepoliaTestnet, sepolia } from "viem/chains";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
export const createWagmiConfig = () =>
  createConfig({
    chains: [mantleSepoliaTestnet, sepolia],
    multiInjectedProviderDiscovery: false,
    transports: {
      [mantleSepoliaTestnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
      [sepolia.id]: http(process.env.L1_RPC),
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
          "",
        walletConnectors: [
          EthereumWalletConnectors,
        ] as any,
        overrides: {
          evmNetworks: (networks) => networks,
        },
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
