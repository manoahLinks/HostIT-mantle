import { createPublicClient, createWalletClient, http, custom, type Chain, type WalletClient } from "viem";
import { mantleSepoliaTestnet, sepolia } from "viem/chains";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.sepolia.mantle.xyz";

type SupportedChainName = 'mantleSepoliaTestnet' | 'sepolia';

const CHAIN_MAP: Record<SupportedChainName, Chain> = {
  mantleSepoliaTestnet,
  sepolia,
};

const selectedChainName = (process.env.NEXT_PUBLIC_CHAIN?.toLowerCase() as SupportedChainName) || "mantleSepoliaTestnet";
export const SELECTED_CHAIN = CHAIN_MAP[selectedChainName] ?? mantleSepoliaTestnet;

export const publicClient = createPublicClient({
  chain: SELECTED_CHAIN,
  transport: http(RPC_URL),
});

// Legacy walletClient for backwards compatibility - prefer getWalletClient() for dynamic wallet access
export const walletClient = typeof window !== "undefined" && (window as any).ethereum
  ? createWalletClient({
      chain: SELECTED_CHAIN,
      transport: custom((window as any).ethereum),
    })
  : undefined;

// Dynamic wallet client getter - use this when you have a provider from Dynamic Labs
export const getWalletClient = (provider: any): WalletClient | undefined => {
  if (!provider) return undefined;
  return createWalletClient({
    chain: SELECTED_CHAIN,
    transport: custom(provider),
  });
};

export const DIAMOND_ADDRESS = process.env.NEXT_PUBLIC_DIAMOND_CONTRACT_ADDRESS as `0x${string}`;