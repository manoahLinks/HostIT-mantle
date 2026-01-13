import { createPublicClient, createWalletClient, http, custom, type Chain } from "viem";
import { mantleSepoliaTestnet } from "viem/chains";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.sepolia.mantle.xyz";

type SupportedChainName = 'mantleSepoliaTestnet';

const CHAIN_MAP: Record<SupportedChainName, Chain> = {
  mantleSepoliaTestnet
};

const selectedChainName = (process.env.NEXT_PUBLIC_CHAIN?.toLowerCase() as SupportedChainName) || "mantleSepoliaTestnet";
export const SELECTED_CHAIN = CHAIN_MAP[selectedChainName] ?? mantleSepoliaTestnet;

export const publicClient = createPublicClient({
  chain: SELECTED_CHAIN,
  transport: http(RPC_URL),
});

export const walletClient = typeof window !== "undefined" && (window as any).ethereum
  ? createWalletClient({
      chain: SELECTED_CHAIN,
      transport: custom((window as any).ethereum),
    })
  : undefined;

export const DIAMOND_ADDRESS = process.env.NEXT_PUBLIC_DIAMOND_CONTRACT_ADDRESS as `0x${string}`;