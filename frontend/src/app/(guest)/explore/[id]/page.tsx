"use client";

import React, { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { GoDotFill } from "react-icons/go";
import { useParams, useRouter } from "next/navigation";
import TicketPoap from "@/components/dashboard/TicketPoap";
import { FaBookmark } from "react-icons/fa6";
import { IoIosShareAlt } from "react-icons/io";
import { Button } from "@/components/ui/button";
import GooMap from "@/components/map";
// import removed: allEvents dummy data
import { convertDateFormat } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { GiPadlock } from "react-icons/gi";
import { useContractRead } from "@/hooks/useContract";
import { formatEther } from "viem";
import { toast } from "sonner";

const Page = () => {
  const router = useRouter();
  const { id } = useParams();
  const [eventJson, setEventJson] = useState<any | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${id}`);
        if (!res.ok) throw new Error("Failed to fetch event");
        const data = await res.json();
        setEventJson(data.event);
      } catch (e: any) {
        console.error(e);
        toast.error(e.message || "Failed to load event");
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
    <div className="px-4 sm:px-6 md:px-8 2xl:px-12">
      <div
        className="h-10 flex justify-center items-center w-16 rounded-lg font-semibold bg-subsidiary hover:bg-white hover:text-subsidiary hover:cursor-pointer text-white mt-4"
        onClick={() => router.back()}
      >
        <IoIosArrowRoundBack size={40} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 my-6">
        {/* Left Side */}
        <div className="w-full lg:w-2/3 relative">
          <img
            src={eventJson?.image ? `https://gateway.pinata.cloud/ipfs/${eventJson.image}` : "/event-image.png"}
            alt="event-image"
            className="w-full rounded-3xl h-48 sm:h-56 2xl:h-64 object-cover"
          />

          <div className="absolute top-4 left-4 px-4 py-1 rounded-full font-semibold text-base z-10 border-2 border-white bg-[#13193980] text-white">
            {isFree ? "Free" : "Paid"}
          </div>

          <div className="my-6 border-2 border-subsidiary rounded-full w-64 sm:w-72 2xl:w-96 flex justify-center items-center h-10 sm:h-12 2xl:h-14">
            <h1 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent uppercase">
              Description
            </h1>
          </div>

          <div
            className="text-white text-base sm:text-lg 2xl:text-xl prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: eventJson?.description || '' }}
          />
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-1/3 2xl:px-6 flex flex-col mb-14 gap-6 md:mb-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent">
              {eventJson?.name}
            </h1>
            <div className="flex gap-2 items-center mt-1">
              <p className="uppercase text-sm sm:text-base 2xl:text-lg text-white">
                {/* Date not in metadata; placeholder */}
              </p>
              <GoDotFill className="text-white text-base sm:text-xl" />
              <p className="uppercase text-sm sm:text-base 2xl:text-lg text-white">
                {/* Time placeholder */}
              </p>
            </div>
          </div>

          <TicketPoap isTicket isAttendee ticketId={ticketId} />

          <div className="flex flex-wrap sm:flex-nowrap items-center justify-end gap-4">
            <div className="bg-subsidiary flex justify-center items-center rounded-full h-11 w-11 sm:h-12 sm:w-12 2xl:h-14 2xl:w-14">
              <FaBookmark className="w-[22px] h-[22px] sm:w-[25px] sm:h-[25px] 2xl:w-[30px] 2xl:h-[30px]" color="#FFFFFF" />
            </div>
            <div className="bg-subsidiary flex justify-center items-center rounded-full h-11 w-11 sm:h-12 sm:w-12 2xl:h-14 2xl:w-14">
              <IoIosShareAlt className="w-[22px] h-[22px] sm:w-[25px] sm:h-[25px] 2xl:w-[30px] 2xl:h-[30px]" color="#FFFFFF" />
            </div>
            <Dialog>
              <DialogTrigger className="text-sm sm:text-base 2xl:text-lg h-11 sm:h-12 2xl:h-14 w-40 sm:w-48 2xl:w-56 rounded-lg bg-subsidiary hover:bg-white hover:text-subsidiary text-white font-semibold">
                Register
              </DialogTrigger>
              <DialogContent className="border bg-principal border-subsidiary rounded-3xl p-0">
                <div className="p-8 sm:p-12 rounded-t-3xl bg-subsidiary w-full flex justify-center items-center">
                  <GiPadlock color="#ffffff" size={64} />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-center items-center gap-4">
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent">
                    {isFree ? "This ticket is free" : `This ticket costs ${feeEthStr} ETH`}
                  </h1>
                  <Button
                    className="text-sm sm:text-base 2xl:text-lg h-11 sm:h-12 2xl:h-14 w-44 sm:w-52 font-semibold bg-subsidiary hover:bg-white hover:text-subsidiary rounded-xl"
                    onClick={() => router.push("/attendee-login")}
                  >
                    Log in
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div>
            <GooMap />
          </div>

          <TicketPoap isTicket={false} isAttendee ticketId={ticketId} />
        </div>
      </div>
    </div>
  );
};

export default Page;
