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
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { GiPadlock } from "react-icons/gi";
import QRCode from "react-qr-code";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BsFolder } from "react-icons/bs";
import { IoCartOutline } from "react-icons/io5";
import { RiShieldUserLine } from "react-icons/ri";
import { PiBroadcast } from "react-icons/pi";
import { PiUploadSimpleThin } from "react-icons/pi";
import { TbMessageOff } from "react-icons/tb";
import MerchCard from "@/components/dashboard/MerchCard";
import { MdOutlineQrCodeScanner } from "react-icons/md";
import { Input } from "@/components/ui/input";
import { MdAnalytics } from "react-icons/md";
import { useContractRead, useContractWrite } from "@/hooks/useContract";
import { formatEther } from "viem";
import { useWithdrawERC721ToL1 } from '@/hooks/useWithdrawERC721ToL1';
import { toast } from "sonner";

const Page = () => {
  const router = useRouter();
  const { id } = useParams();
  const [uploadImage, setUploadImage] = useState(true);
  const [tokenId, setTokenId] = useState<string>("");
  const [eventJson, setEventJson] = useState<any | null>(null);

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

  const checkedInQuery = useContractRead<readonly string[]>({
    abiName: "CheckInFacetAbi",
    functionName: "getCheckedIn",
    args: ticketId !== null ? [BigInt(ticketId)] : undefined,
    enabled: ticketId !== null,
  });

  const checkInMutation = useContractWrite<[number, string, bigint]>({
    abiName: "CheckInFacetAbi",
    functionName: "checkIn",
  });

  // ---------------------------------
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

  return (
    <Tabs defaultValue="details" className="w-full">
      <div className="mx-4 sm:mx-6 md:mx-8 2xl:mx-12">
        {/* Header Section - Mobile First */}
        <div className="flex flex-col gap-4 md:flex-row md:gap-12 w-full">
          {/* Navigation and Tabs */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:w-2/3 md:mr-5">
            <div
              className="h-10 flex justify-center items-center w-16 rounded-lg font-semibold bg-subsidiary hover:bg-white hover:text-subsidiary hover:cursor-pointer text-white"
              onClick={() => router.back()}
            >
              <IoIosArrowRoundBack size={40} />
            </div>
            
            {/* Mobile Tabs - Horizontal scroll */}
            <div className="w-full sm:w-auto overflow-x-auto">
              <TabsList className="flex gap-2 sm:gap-6 bg-transparent border-subsidiary border h-12 min-w-max">
                <TabsTrigger
                  value="details"
                  className="flex gap-1 text-center items-center justify-center text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                >
                  <BsFolder size={16} className="sm:w-5 sm:h-5" />
                  <span className="sm:inline">Details</span>
                </TabsTrigger>
                <TabsTrigger
                  value="live-updates"
                  className="flex gap-1 text-center items-center justify-center text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                >
                  <PiBroadcast size={16} className="sm:w-5 sm:h-5" />
                  <span className="sm:inline">Live Updates</span>
                </TabsTrigger>
                <TabsTrigger
                  value="merch"
                  className="flex gap-1 text-center items-center justify-center text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                >
                  <IoCartOutline size={16} className="sm:w-5 sm:h-5" />
                  <span className="sm:inline">Merch</span>
                </TabsTrigger>
                <TabsTrigger
                  value="role"
                  className="flex gap-1 text-center items-center justify-center text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                >
                  <RiShieldUserLine size={16} className="sm:w-5 sm:h-5" />
                  <span className="sm:inline">Role</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          {/* Countdown */}
          <div className="w-full md:w-1/3 2xl:px-6 flex items-center justify-end italic">
            <p className="text-white font-medium text-sm sm:text-lg 2xl:text-xl py-2 px-4 sm:px-6 rounded-lg border-2">
              14 days to go
            </p>
          </div>
        </div>

        {/* Details Tab Content */}
        <TabsContent value="details" className="min-h-[82vh]">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 my-4">
            {/* Main Content - Left Side */}
            <div className="w-full lg:w-2/3 relative">
              <img
                src={eventJson?.image ? `https://gateway.pinata.cloud/ipfs/${eventJson.image}` : "/event-image.png"}
                alt="event-image"
                className="w-full rounded-3xl h-48 sm:h-56 2xl:h-64 object-cover"
              />

              <div className="absolute top-4 left-4 px-3 sm:px-4 py-1 rounded-full font-semibold text-sm sm:text-base z-10 border-2 border-white bg-[#13193980] text-white">
                {isFree ? "Free" : "Paid"}
              </div>
              
              <div className="my-6 2xl:my-10 border-2 border-subsidiary rounded-full w-full sm:w-72 2xl:w-96 flex justify-center items-center h-12 2xl:h-14 mx-auto lg:mx-0">
                <h1 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent uppercase">
                  Description
                </h1>
              </div>
              
              <div
                className="text-white text-base sm:text-lg 2xl:text-xl prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: eventJson?.description || '' }}
              />
            </div>

            {/* Sidebar - Right Side */}
            <div className="w-full lg:w-1/3 2xl:px-6 flex flex-col gap-4 2xl:gap-6 mb-14 md:mb-0">
              {/* Event Title and Date */}
              <div>
                <h1 className="text-xl sm:text-2xl 2xl:text-3xl font-semibold bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent">
                  {eventJson?.name}
                </h1>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center">
                  <p className="uppercase text-sm sm:text-base 2xl:text-lg text-white">
                    {/* Date unavailable in metadata */}
                  </p>
                  <GoDotFill className="text-white text-xl hidden sm:block" />
                  <p className="uppercase text-sm sm:text-base 2xl:text-lg text-white">
                    {/* Time unavailable in metadata */}
                  </p>
                </div>
              </div>

              {/* Ticket POAP */}
              <TicketPoap isTicket isAttendee={true} ticketId={ticketId} />

              {/* Action Buttons */}
              <div className="flex flex-row items-center justify-end gap-4">
                <div className="flex gap-4">
                  <div className="bg-subsidiary flex justify-center items-center rounded-full h-12 w-12 2xl:h-14 2xl:w-14">
                    <FaBookmark
                      className="w-[20px] h-[20px] sm:w-[25px] sm:h-[25px] 2xl:w-[30px] 2xl:h-[30px]"
                      color={"#FFFFFF"}
                    />
                  </div>
                  <div className="bg-subsidiary flex justify-center items-center rounded-full h-12 w-12 2xl:h-14 2xl:w-14">
                    <IoIosShareAlt
                      className="w-[20px] h-[20px] sm:w-[25px] sm:h-[25px] 2xl:w-[30px] 2xl:h-[30px]"
                      color={"#FFFFFF"}
                    />
                  </div>
                </div>
                
                <Dialog>
                  <DialogTrigger
                    className="text-sm 2xl:text-lg h-12 2xl:h-14 w-full sm:w-48 2xl:w-56 rounded-lg bg-subsidiary hover:bg-white hover:text-subsidiary text-white font-semibold"
                    disabled
                  >
                    Claim Refund
                  </DialogTrigger>
                  <DialogContent className="border bg-principal border-subsidiary rounded-3xl p-0 mx-4 max-w-md">
                    <div className="p-8 sm:p-12 rounded-t-3xl bg-subsidiary w-full flex justify-center items-center">
                      <GiPadlock color="#ffffff" size={60} className="sm:w-[72px] sm:h-[72px]" />
                    </div>
                    <div className="p-6 sm:p-8 flex flex-col justify-center items-center gap-4">
                      <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent text-center">
                        This event has been cancelled
                      </h1>
                      <Button
                        className="text-sm 2xl:text-lg h-12 2xl:h-14 w-52 font-semibold bg-subsidiary hover:bg-white hover:text-subsidiary rounded-xl"
                        onClick={() => {
                          router.push("/attendee-login");
                        }}
                      >
                        Claim refund
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                 <Button
                      onClick={handleWithdrawERC721}
                      className="text-sm sm:text-base h-12 2xl:h-14 px-6 2xl:px-8 font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isWithdrawingERC721 ? `${withdrawERC721Step.message}...` : "Withdraw ERC721"}
                    </Button>
              </div>

              {/* Map and QR Code Section */}
              <div className="flex flex-col sm:flex-row gap-4 md:min-h-48 h-full">
                <div className="w-full sm:w-1/2 h-full">
                   <GooMap />

                </div>
                <div className="md:hidden">
                  <QRCode value={"ticketData"}
                            className="w-full h-full bg-white p-5 rounded-2xl"/>
                </div>
                <div className="hidden w-full sm:w-1/2 h-full md:flex justify-center items-center min-h-[200px] ">
                  <div className="relative flex items-center justify-center w-full h-full">
                    <div className="flex w-full h-full relative">
                      <img
                        src="/TicketBorder.png"
                        alt="ticket-border"
                        className="md:block w-full h-full max-h-[330px]"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col gap-1 items-center bg-white px-2 sm:px-3 border-gray-400 rounded-xl m-2 sm:m-4 2xl:m-4">
                          <QRCode
                            value={"ticketData"}
                            className="w-full h-full max-h-[220px] p-3"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* POAP Section */}
              <TicketPoap isTicket={false} isAttendee={true} ticketId={ticketId} />
            </div>
          </div>
        </TabsContent>

        {/* Live Updates Tab Content */}
        <TabsContent value="live-updates" className="min-h-[82vh]">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent inline-flex my-4">
              Media Library
            </h1>
            
            <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-end">
              <div className="flex flex-col sm:flex-row gap-4">
                <div
                  className={`flex flex-col justify-center items-center rounded-xl h-32 w-full sm:w-52 border-subsidiary border cursor-pointer hover:bg-subsidiary ${
                    uploadImage ? "bg-subsidiary" : "bg-transparent"
                  }`}
                  onClick={() => setUploadImage(true)}
                >
                  <h3
                    className={`font-semibold text-sm sm:text-base text-center ${
                      uploadImage
                        ? "text-white"
                        : "bg-transparent bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent"
                    }`}
                  >
                    Uploaded Images
                  </h3>
                  <p className="text-white text-3xl sm:text-4xl">200</p>
                </div>
                <div
                  className={`flex flex-col justify-center items-center rounded-xl h-32 w-full sm:w-52 border-subsidiary border cursor-pointer hover:bg-subsidiary ${
                    !uploadImage ? "bg-subsidiary" : "bg-transparent"
                  }`}
                  onClick={() => setUploadImage(false)}
                >
                  <h3
                    className={`font-semibold text-sm sm:text-base text-center ${
                      !uploadImage
                        ? "text-white"
                        : "bg-transparent bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent"
                    }`}
                  >
                    Feedbacks
                  </h3>
                  <p className="text-white text-3xl sm:text-4xl">0</p>
                </div>
              </div>
              
              {uploadImage ? (
                <Button
                  className="text-sm 2xl:text-lg h-12 2xl:h-14 w-full sm:w-56 font-semibold rounded-lg bg-subsidiary hover:bg-white hover:text-subsidiary text-white cursor-pointer mt-4 lg:mt-0 2xl:mr-6"
                  disabled
                >
                  Upload Media
                </Button>
              ) : (
                <Button
                  className="text-sm 2xl:text-lg h-12 2xl:h-14 w-full sm:w-56 font-semibold rounded-lg bg-subsidiary hover:bg-white hover:text-subsidiary text-white cursor-pointer mt-4 lg:mt-0 2xl:mr-6"
                  disabled
                >
                  Post a Feedback
                </Button>
              )}
            </div>

            {uploadImage ? (
              <div className="min-h-[400px] sm:min-h-[650px] 2xl:min-h-[50vh] flex flex-col gap-6 sm:gap-10 justify-center items-center">
                <div className="flex flex-col gap-6 sm:gap-10 justify-center items-center px-4 my-20">
                  <ul className="flex flex-col gap-2 text-white text-sm sm:text-base">
                    <li className="flex items-start gap-2">
                      <GoDotFill className="mt-1 flex-shrink-0" /> 
                      Upload clear, high-quality images (no blurry or low-light shots).
                    </li>
                    <li className="flex items-start gap-2">
                      <GoDotFill className="mt-1 flex-shrink-0" />
                      Showcase key moments: speakers, crowds, performances, and highlights.
                    </li>
                    <li className="flex items-start gap-2">
                      <GoDotFill className="mt-1 flex-shrink-0" />
                      Use real-time photos that reflect the true vibe of the event.
                    </li>
                    <li className="flex items-start gap-2">
                      <GoDotFill className="mt-1 flex-shrink-0" />
                      Formats supported: JPG, PNG. Max size: 10MB per image.
                    </li>
                  </ul>
                  
                  <div className="flex flex-col p-4 border border-dashed border-subsidiary rounded-2xl justify-center items-center w-full max-w-[540px] h-[250px] sm:h-[320px]">
                    <PiUploadSimpleThin size={60} className="sm:w-[80px] sm:h-[80px]" color="#ffffff" />
                    <h1 className="text-lg sm:text-2xl font-semibold bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent inline-flex my-4 text-center">
                      Upload Media
                    </h1>
                    <Button
                      className="text-sm 2xl:text-lg h-12 2xl:h-14 w-full sm:w-56 font-semibold rounded-lg bg-subsidiary hover:bg-white hover:text-subsidiary text-white cursor-pointer"
                      disabled
                    >
                      Upload
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="min-h-[400px] sm:min-h-[430px] 2xl:min-h-[50vh] flex flex-col gap-6 sm:gap-10 justify-center items-center">
                <div className="flex flex-col justify-center items-center">
                  <TbMessageOff size={120} className="sm:w-[150px] sm:h-[150px]" />
                  <p className="text-white text-lg sm:text-xl">No feedbacks yet</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Merch Tab Content */}
        <TabsContent value="merch" className="">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent inline-flex my-4">
              Merchandise
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-[1.3%] mb-10 md:mb-0">
              <div className="mb-6">
                <MerchCard />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Role Tab Content */}
        <TabsContent value="role" className="min-h-[82vh] mb-6 md:mb-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent inline-flex my-4">
              Assigned Role
            </h1>
            
            <div className="border border-white rounded-3xl flex flex-col lg:flex-row gap-6 lg:gap-10 w-full py-6 sm:py-7 px-4 sm:px-7">
              <div className="w-full lg:w-3/5 flex flex-col gap-4 sm:gap-6">
                <div className="flex justify-between items-start">
                  <h1 className="text-lg sm:text-2xl font-bold text-white">CHECKIN ASSISTANT</h1>
                  <MdOutlineQrCodeScanner size={30} className="sm:w-[40px] sm:h-[40px] text-white" />
                </div>
                
                <ul className="flex flex-col gap-2 text-white">
                  <li className="flex items-start gap-2 text-xs sm:text-sm">
                    <GoDotFill className="mt-1 flex-shrink-0" /> 
                    Search by attendee email address or scan their QR code to locate their ticket
                  </li>
                  <li className="flex items-start gap-2 text-xs sm:text-sm">
                    <GoDotFill className="mt-1 flex-shrink-0" />
                    Check in attendee and wait for on-chain confirmation.
                  </li>
                </ul>

                <div className="mt-4 p-4 border rounded-2xl">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm sm:text-base">Checked-in attendees</p>
                    <p className="text-white text-sm sm:text-base font-semibold">
                      {checkedInQuery.isLoading ? "Loading..." : (checkedInQuery.data?.result.length ?? 0)}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-col sm:flex-row gap-3">
                    <Input
                      placeholder="Your tokenId"
                      value={tokenId}
                      onChange={(e) => setTokenId(e.target.value)}
                      className="text-white"
                    />
                    <Button
                      variant="brand"
                      onClick={async () => {
                        try {
                          // Use connected account as ticket owner
                          const addresses = (await import("@/lib/chain")).walletClient
                            ? await (await import("@/lib/chain")).walletClient!.getAddresses()
                            : [];
                          const owner = addresses[0];
                          if (!owner) {
                            alert("Please connect a wallet.");
                            return;
                          }
                          const tid = BigInt(tokenId || "0");
                          if (ticketId === null) {
                            alert("Ticket not available for this event.");
                            return;
                          }
                          await checkInMutation.mutateAsync({
                            args: [Number(ticketId), owner, tid],
                          });
                          alert("Check-in transaction submitted.");
                        } catch (e) {
                          console.error(e);
                          alert("Failed to submit check-in.");
                        }
                      }}
                    >
                      Check me in
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Enter attendee's email address"
                    className="w-full sm:w-3/4 h-12 px-4 sm:px-10 text-sm"
                  />
                  <Button className="w-full sm:w-1/4 py-4 bg-subsidiary h-12" disabled>
                    Search
                  </Button>
                </div>
              </div>
              
              <div className="w-full lg:w-2/5 flex flex-col justify-between py-4 sm:py-6 px-4 sm:px-8 rounded-xl bg-subsidiary text-white">
                <div className="flex items-center gap-2 mb-4 lg:mb-0">
                  <MdAnalytics size={20} />
                  <p className="text-base sm:text-lg text-white">TRACKER</p>
                </div>
                <div className="flex justify-between">
                  <div className="flex flex-col items-start">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white">1500</h1>
                    <p className="text-xs text-white">Registered</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white">0</h1>
                    <p className="text-xs text-white">Verified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default Page;