import { useMutation } from "@tanstack/react-query";
import { publicClient, walletClient as defaultWalletClient, DIAMOND_ADDRESS, getWalletClient as getGlobalWalletClient, SELECTED_CHAIN } from "@/lib/chain";
import MarketplaceFacetAbi from "@/abis/MarketplaceFacetAbi.json";
import { createRegistration, type RegistrationPayload } from "@/lib/services/registration";
import type { WalletClient } from "viem";

export type RegisterInput = RegistrationPayload & {
  ticketId: number;
  feeType?: number; // default native token = 0
  walletClient?: WalletClient;
};

export function useRegisterForEvent() {
  return useMutation<{ receiptHash: `0x${string}` }, Error, RegisterInput>({
    mutationKey: ["register-for-event"],
    mutationFn: async (input) => {
      const activeWalletClient = input.walletClient ||
        (typeof window !== "undefined" && (window as any).ethereum ? getGlobalWalletClient((window as any).ethereum) : defaultWalletClient);

      if (!activeWalletClient) throw new Error("Wallet not available. Connect a wallet.");
      const [account] = await activeWalletClient.getAddresses();
      if (!account) throw new Error("No account connected.");

      const feeType = input.feeType ?? 0;
      // 1) Read fee for ticket
      const feeWei = await publicClient.readContract({
        address: DIAMOND_ADDRESS,
        abi: MarketplaceFacetAbi as any,
        functionName: "getTicketFee",
        args: [BigInt(input.ticketId), feeType],
      });

      // 2) Mint/payable purchase
      const hash = await activeWalletClient.writeContract({
        address: DIAMOND_ADDRESS,
        account,
        abi: MarketplaceFacetAbi as any,
        functionName: "mintTicket",
        args: [BigInt(input.ticketId), feeType, account],
        value: feeWei as bigint,
        chain: SELECTED_CHAIN,
      });

      await publicClient.waitForTransactionReceipt({ hash });

      // 3) Persist registration
      await createRegistration({
        eventId: input.eventId,
        eventName: input.eventName,
        role: input.role,
        name: input.name,
        email: input.email,
        xhandle: input.xhandle,
        agreeToNewsletter: input.agreeToNewsletter,
        address: account,
      });

      return { receiptHash: hash };
    },
  });
}