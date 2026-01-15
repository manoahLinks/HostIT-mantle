import { useMutation } from "@tanstack/react-query";
import { createEvent, updateEvent, type EventCreatePayload } from "@/lib/services/events";
import { publicClient, DIAMOND_ADDRESS, getWalletClient, SELECTED_CHAIN } from "@/lib/chain";
import FactoryFacetAbi from "@/abis/FactoryFacetAbi.json";
import type { AbiEvent, WalletClient } from "viem";
import { parseEther, decodeEventLog } from "viem";

export type CreateEventInput = {
  // Backend fields
  name: string;
  image: string;
  description: string;
  organizer_name: string;
  event_type: string;
  event_category: string;
  location: string;
  schedule: Array<{ start_time: string; end_time: string; activity: string; description: string }>;
  // Ticket fields
  ticketName: string;
  ticketSymbol?: string; // default: HIT
  ticketPriceEth: string; // e.g. "0.01"
  ticketQuantity: number;
  startDateIso: string; // ISO datetime
  endDateIso: string; // ISO datetime
  maxTicketsPerUser?: number; // default: 1
  isRefundable?: boolean; // default: false
  // Wallet client from Dynamic Labs
  walletClient?: WalletClient;
};

function toUnixSeconds(iso: string): number {
  return Math.floor(new Date(iso).getTime() / 1000);
}

export function useCreateEvent() {
  return useMutation<{ eventId: string; ticketId: bigint; metadataUri: string }, Error, CreateEventInput>({
    mutationKey: ["create-event-and-ticket"],
    mutationFn: async (input) => {
      // 1) Create event in backend and get metadata URI
      const payload: EventCreatePayload = {
        name: input.name,
        image: input.image,
        description: input.description,
        organizer_name: input.organizer_name,
        event_type: input.event_type,
        event_category: input.event_category,
        location: input.location,
        schedule: input.schedule ?? [],
      };
      const { id: eventId, link: metadataUri } = await createEvent(payload);

      // 2) Write createTicket on-chain - use provided walletClient or try window.ethereum
      const activeWalletClient = input.walletClient || (typeof window !== "undefined" && (window as any).ethereum ? getWalletClient((window as any).ethereum) : undefined);
      if (!activeWalletClient) throw new Error("Wallet not connected. Please connect your wallet first.");
      const [account] = await activeWalletClient.getAddresses();
      if (!account) throw new Error("No account connected. Please connect your wallet.");

      const startTime = toUnixSeconds(input.startDateIso);
      const endTime = toUnixSeconds(input.endDateIso);
      const purchaseStartTime = 0;
      const maxTickets = BigInt(input.ticketQuantity);
      const maxTicketsPerUser = BigInt(input.maxTicketsPerUser ?? 1);
      const isFree = Number(input.ticketPriceEth) === 0;
      const isRefundable = Boolean(input.isRefundable);
      const ticketName = input.ticketName;
      const ticketSymbol = input.ticketSymbol ?? "HIT";
      const feeTypes = [0]; // assume native token fee type = 0
      const fees = [parseEther(input.ticketPriceEth)];

      const hash = await activeWalletClient.writeContract({
        address: DIAMOND_ADDRESS,
        chain: SELECTED_CHAIN,
        account,
        abi: FactoryFacetAbi as any,
        functionName: "createTicket",
        args: [
          {
            startTime,
            endTime,
            purchaseStartTime,
            maxTickets,
            maxTicketsPerUser,
            isFree,
            isRefundable,
            name: ticketName,
            symbol: ticketSymbol,
            uri: metadataUri,
          },
          feeTypes,
          fees,
        ] as any,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // 3) Decode TicketCreated to get ticketId
      let ticketId: bigint | null = null;
      const events = (FactoryFacetAbi as any).filter((item: any) => item.type === "event") as AbiEvent[];
      const ticketCreated = events.find((e: any) => e.name === "TicketCreated");
      if (ticketCreated) {
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: [ticketCreated] as any,
              data: log.data,
              topics: log.topics,
            }) as { eventName: string; args: any };
            if (decoded.eventName === "TicketCreated") {
              // indexed ticketId is the first param or named arg
              const decodedArgs: any = decoded.args as any;
              const id = decodedArgs?.ticketId ?? decodedArgs?.[0];
              if (id != null) {
                ticketId = typeof id === "bigint" ? id : BigInt(id);
              }
              break;
            }
          } catch {}
        }
      }

      if (!ticketId) {
        throw new Error("TicketCreated event not found or ticketId missing");
      }

      // 4) Update event with ticketId
      await updateEvent(eventId, { ticketId: Number(ticketId) });

      return { eventId, ticketId, metadataUri };
    },
  });
}