"use client";

import React, { useEffect, useMemo, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { GoDotFill } from "react-icons/go";
import { useParams, useRouter } from "next/navigation";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import TicketPoap from "@/components/dashboard/TicketPoap";
import { FaBookmark } from "react-icons/fa6";
import { IoIosShareAlt } from "react-icons/io";
import { Button } from "@/components/ui/button";
import GooMap from "@/components/map";
import { convertDateFormat } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { GiPadlock } from "react-icons/gi";
import { useContractRead } from "@/hooks/useContract";
import { formatEther } from "viem";
import { useRegisterForEvent } from "@/hooks/useRegisterForEvent";
import { useRegistrationForm } from "@/hooks/useRegistrationForm";
import { toast } from "sonner";
import { useMantleDeposit } from "@/hooks/useDepositMntFromL1";
import { useMantleWithdrawal } from '@/hooks/useWithdrawMntToL1';
import { useWithdrawERC721ToL1 } from '@/hooks/useWithdrawERC721ToL1';

type EventJson = {
  platform: string;
  name: string;
  image: string;
  description: string;
  external_url: string;
  ticketId?: number | null;
  attributes: Array<{ trait_type: string; value: any }>;
};

const Page = () => {
  const router = useRouter();
  const { id } = useParams();
  const { primaryWallet } = useDynamicContext();
  const [eventJson, setEventJson] = useState<EventJson | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Registration hooks
  const registerMutation = useRegisterForEvent();
  const {
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
  } = useRegistrationForm();

  // Registration handler
  const handleRegister = async () => {
    // Validate form
    if (!validateForm()) {
      toast.error("Please fix form errors");
      return;
    }

    // Check if we have required data
    if (!eventJson?.ticketId || !eventJson?.name || !id) {
      toast.error("Event data not loaded");
      return;
    }

    try {
      // Get wallet client directly from Dynamic Labs primaryWallet
      const walletClient = await (primaryWallet as any)?.getWalletClient?.();

      await registerMutation.mutateAsync({
        ...formData,
        eventId: id as string,
        eventName: eventJson.name,
        ticketId: Number(eventJson.ticketId),
        role: "attendee",
        walletClient,
      });

      toast.success("Successfully registered for the event!");
      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error?.message || "Registration failed. Please try again.");
    }
  };

  // Mantle deposit hook
  const { depositMNT, step, isLoading: isBridging } = useMantleDeposit({
    l1ChainId: 11155111,
    l2ChainId: 5003,
    l1RpcUrl: "https://1rpc.io/sepolia",
    l2RpcUrl: "https://rpc.sepolia.mantle.xyz",
    l1MntAddress: "0x65e37B558F64E2Be5768DB46DF22F93d85741A9E" as `0x${string}`,
    l2MntAddress: "0x0000000000000000000000000000000000000000" as `0x${string}`,
  });

  // Bridge and purchase handler Mnt l1 - l2
  const handleBridgeAndPurchase = async () => {
    if (!feeEthStr || isFree) {
      toast.error("Cannot bridge for free events");
      return;
    }

    try {
      toast.info("Starting MNT bridge from L1 to L2...");
      // @ts-ignore
      const provider = (await (primaryWallet?.connector as any)?.getProvider?.()) || (typeof window !== 'undefined' ? (window as any).ethereum : undefined);
      await depositMNT(feeEthStr, { provider });
      toast.success("Bridge complete! You can now purchase the ticket.");
    } catch (error: any) {
      console.error("Bridge error:", error);
      // Error toast already handled by the hook
    }
  };

  // Mantle withdraw hook
  const { withdrawMNT, step: withdrawStep, isLoading: isWithdrawing } = useMantleWithdrawal({
    l1ChainId: 11155111,
    l2ChainId: 5003,
    l1RpcUrl: "https://1rpc.io/sepolia",
    l2RpcUrl: "https://rpc.sepolia.mantle.xyz",
    l1MntAddress: "0x65e37B558F64E2Be5768DB46DF22F93d85741A9E" as `0x${string}`,
    l2MntAddress: "0x0000000000000000000000000000000000000000" as `0x${string}`,
  })

  // bridge Mnt from l2 to L1
  const handleBridgeMntL2ToL1 = async () => {
    try {
      toast.info("Starting MNT bridge from L2 to L1...");
      // @ts-ignore
      const provider = (await (primaryWallet?.connector as any)?.getProvider?.()) || (typeof window !== 'undefined' ? (window as any).ethereum : undefined);
      await withdrawMNT(feeEthStr, { provider });
      toast.success("Bridge complete!");
    } catch (error: any) {
      console.error("Bridge error:", error);
      // Error toast already handled by the hook
    }
  };

  // withdraw ERC721 from L2 to L1
  const { withdrawERC721, step: withdrawERC721Step, isLoading: isWithdrawingERC721 } = useWithdrawERC721ToL1({
    l1ChainId: 11155111,
    l2ChainId: 5003,
    l1RpcUrl: "https://1rpc.io/sepolia",
    l2RpcUrl: "https://rpc.sepolia.mantle.xyz",
  })

  const handleWithdrawERC721 = async () => {
    try {
      toast.info("Starting ERC721 withdrawal from L2 to L1...");
      // @ts-ignore
      const provider = (await (primaryWallet?.connector as any)?.getProvider?.()) || (typeof window !== 'undefined' ? (window as any).ethereum : undefined);
      await withdrawERC721('0xD171f2a5c38c52D255091B5232e1e710EAD3CEde' as `0x${string}`, '0x5a87BD93ac3eD187AB5B86E4C55DA2E480165A16' as `0x${string}`, '1', { provider });
      toast.success("Withdrawal complete!");
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      // Error toast already handled by the hook
    }
  };
  // -----------------------------------------------------

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        setEventJson(data.event);
      } catch (e) {
        console.error(e);
      }
    };
    if (id) fetchEvent();
  }, [id]);

  const ticketId = eventJson?.ticketId ?? null;
  const feeTypeNative = 0;
  const { data: feeData } = useContractRead<bigint>({
    abiName: "MarketplaceFacetAbi",
    functionName: "getTicketFee",
    args: ticketId !== null ? [BigInt(ticketId), feeTypeNative] : undefined,
    enabled: ticketId !== null,
  });
  const feeWei = (feeData?.result ?? BigInt(0)) as bigint;
  const isFree = feeWei === BigInt(0);
  const feeEthStr = formatEther(feeWei);

  return (
    <div className="px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-12">
      {/* Back button */}
      <div
        className="h-10 flex justify-center items-center w-16 rounded-lg font-semibold bg-subsidiary hover:bg-white hover:text-subsidiary hover:cursor-pointer text-white"
        onClick={() => router.back()}
      >
        <IoIosArrowRoundBack size={40} />
      </div>

      {/* Main content layout */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 my-6">
        {/* Left Section (Image + Description) */}
        <div className="w-full lg:w-2/3 relative">
          <img
            src={eventJson?.image ? `https://gateway.pinata.cloud/ipfs/${eventJson.image}` : "/event-image.png"}
            alt="event-image"
            className="w-full rounded-3xl object-cover h-48 sm:h-56 lg:h-60 2xl:h-64"
          />
          <div className="absolute top-4 left-4 px-4 py-1 rounded-full font-semibold text-base z-10 border-2 border-white bg-[#13193980] text-white">
            {isFree ? "Free" : "Paid"}
          </div>

          <div className="my-6 border-2 border-subsidiary rounded-full w-60 sm:w-72 2xl:w-96 flex justify-center items-center h-12 2xl:h-14">
            <h1 className="text-xl font-semibold bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent uppercase">
              Description
            </h1>
          </div>
          <div
            className="text-white text-base sm:text-lg 2xl:text-xl prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: eventJson?.description || '' }}
          />
        </div>

        {/* Right Section (Details + Actions) */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6 mb-12 md:mb-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent">
              {eventJson?.name}
            </h1>
            <div className="flex flex-wrap gap-2 items-center mt-1">
              <p className="uppercase text-sm sm:text-base text-white">
                {/* Date not in metadata; placeholder */}
              </p>
              <GoDotFill className="text-white text-lg" />
              <p className="uppercase text-sm sm:text-base text-white">
                {/* Time placeholder */}
              </p>
            </div>
          </div>

          <TicketPoap isTicket isAttendee={true} ticketId={ticketId} />

          {/* Action buttons */}
          <div className="flex flex-wrap gap-4 items-center justify-start sm:justify-end">
            <div className="bg-subsidiary flex justify-center items-center rounded-full h-12 w-12 2xl:h-14 2xl:w-14">
              <FaBookmark className="w-[24px] h-[24px] 2xl:w-[30px] 2xl:h-[30px]" color="#FFFFFF" />
            </div>
            <div className="bg-subsidiary flex justify-center items-center rounded-full h-12 w-12 2xl:h-14 2xl:w-14">
              <IoIosShareAlt className="w-[24px] h-[24px] 2xl:w-[30px] 2xl:h-[30px]" color="#FFFFFF" />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger className="text-sm sm:text-base h-12 2xl:h-14 px-6 2xl:px-8 font-semibold rounded-lg bg-subsidiary hover:bg-white hover:text-subsidiary text-white">
                Register/Buy
              </DialogTrigger>

              <DialogContent className="border bg-principal border-subsidiary rounded-3xl p-0 max-w-md">
                <div className="p-8 rounded-t-3xl bg-subsidiary flex justify-center items-center">
                  <GiPadlock color="#ffffff" size={64} />
                </div>

                <div className="p-6 flex flex-col gap-4">
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent text-center">
                    {isFree
                      ? "Register for Free Event"
                      : `Register - ${feeEthStr} ETH`}
                  </h1>

                  {/* Registration Form */}
                  <div className="space-y-4">
                    {/* Name Field */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={() => handleBlur("name")}
                        placeholder="Enter your name"
                        className={`w-full bg-transparent border ${errors.name && touched.name
                          ? "border-red-400"
                          : "border-white/60"
                          } h-12 text-base p-4 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/80`}
                      />
                      {errors.name && touched.name && (
                        <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={() => handleBlur("email")}
                        placeholder="Enter your email"
                        className={`w-full bg-transparent border ${errors.email && touched.email
                          ? "border-red-400"
                          : "border-white/60"
                          } h-12 text-base p-4 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/80`}
                      />
                      {errors.email && touched.email && (
                        <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>

                    {/* X Handle Field (Optional) */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        X Handle (Optional)
                      </label>
                      <input
                        type="text"
                        name="xhandle"
                        value={formData.xhandle}
                        onChange={handleChange}
                        placeholder="@username"
                        className="w-full bg-transparent border border-white/60 h-12 text-base p-4 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/80"
                      />
                    </div>

                    {/* Newsletter Checkbox */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="agreeToNewsletter"
                        id="newsletter"
                        checked={formData.agreeToNewsletter}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-white/60 bg-transparent"
                      />
                      <label htmlFor="newsletter" className="text-white text-sm">
                        Subscribe to newsletter
                      </label>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    className="text-sm sm:text-base h-12 w-full font-semibold bg-subsidiary hover:bg-white hover:text-subsidiary rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleRegister}
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending
                      ? "Processing..."
                      : isFree
                        ? "Register Now"
                        : "Buy Ticket"}
                  </Button>

                  {/* Status Messages */}
                  {registerMutation.isPending && (
                    <p className="text-white/70 text-sm text-center">
                      Please confirm the transaction in your wallet...
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Bridge from L1 to L2 Button */}
            {!isFree && (
              <Button
                onClick={handleBridgeAndPurchase}
                disabled={isBridging}
                className="text-sm sm:text-base h-12 2xl:h-14 px-6 2xl:px-8 font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBridging ? `${step.message}...` : "Purchase with MNT from L1"}
              </Button>
            )}

            {/* Bridge Progress Indicator */}
            {isBridging && (
              <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${step.progress}%` }}
                />
              </div>
            )}

            <Button
              onClick={handleBridgeMntL2ToL1}
              className="text-sm sm:text-base h-12 2xl:h-14 px-6 2xl:px-8 font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isWithdrawing ? `${withdrawStep.message}...` : "Purchase with MNT from L2"}
            </Button>

            <Button
              onClick={handleWithdrawERC721}
              className="text-sm sm:text-base h-12 2xl:h-14 px-6 2xl:px-8 font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isWithdrawingERC721 ? `${withdrawERC721Step.message}...` : "Withdraw ERC721"}
            </Button>
          </div>

          {/* Map */}
          <GooMap />

          {/* Ticket Info */}
          <TicketPoap isTicket={false} isAttendee={true} ticketId={ticketId} />
        </div>
      </div>
    </div>
  );
};

export default Page;
