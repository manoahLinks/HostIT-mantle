"use client";

import React, { useEffect, useMemo, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { GoDotFill } from "react-icons/go";
import { useParams, useRouter } from "next/navigation";
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
import { useMantleDeposit } from '@/hooks/useDepositMntFromL1';

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
  const [eventJson, setEventJson] = useState<EventJson | null>(null);

  const [depositAmount, setDepositAmount] = useState('1');
  const [withdrawAmount, setWithdrawAmount] = useState('0.1');

  const {
    isLoading,
    status,
    txHash,
    depositMNT,
  } = useMantleDeposit({
    l1ChainId: Number(process.env.NEXT_PUBLIC_L1_CHAINID),
    l2ChainId: Number(process.env.NEXT_PUBLIC_L2_CHAINID),
    l1RpcUrl: process.env.NEXT_PUBLIC_L1_RPC!,
    l2RpcUrl: process.env.NEXT_PUBLIC_L2_RPC!,
    privateKey: process.env.NEXT_PUBLIC_PRIV_KEY as `0x${string}`,
    l1MntAddress: process.env.NEXT_PUBLIC_L1_MNT as `0x${string}`,
    l2MntAddress: process.env.NEXT_PUBLIC_L2_MNT as `0x${string}`,
  });

  const handleDeposit = async () => {
    try {
      const hash = await depositMNT(depositAmount);
      alert(`Deposit successful! Hash: ${hash}`);
    } catch (error) {
      alert('Deposit failed');
    }
  };

  // -----------------------------------------------------

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        setEventJson(data);
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
            src={eventJson?.image ?? "/event-image.png"}
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
          <p className="text-white text-base sm:text-lg 2xl:text-xl">
            {eventJson?.description}
          </p>
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
            <Dialog>
              <DialogTrigger className="text-sm sm:text-base h-12 2xl:h-14 px-6 2xl:px-8 font-semibold rounded-lg bg-subsidiary hover:bg-white hover:text-subsidiary text-white">
                Register/Buy
              </DialogTrigger>

              <Button onClick={handleDeposit} className="text-sm sm:text-base h-12 2xl:h-14 px-6 2xl:px-8 font-semibold rounded-lg bg-subsidiary hover:bg-white hover:text-subsidiary text-white">
                Buy with mnt from L1
              </Button>

              <DialogContent className="border bg-principal border-subsidiary rounded-3xl p-0">
                <div className="p-8 rounded-t-3xl bg-subsidiary flex justify-center items-center">
                  <GiPadlock color="#ffffff" size={64} />
                </div>
                <div className="p-6 flex flex-col justify-center items-center gap-4">
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent">
                    {isFree
                      ? "This ticket is free"
                      : `This ticket costs ${feeEthStr} ETH`}
                  </h1>
                  <Button
                    className="text-sm sm:text-base h-12 w-48 font-semibold bg-subsidiary hover:bg-white hover:text-subsidiary rounded-xl"
                    onClick={() => {
                      router.push("/attendee-login");
                    }}
                  >
                    Buy now
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
