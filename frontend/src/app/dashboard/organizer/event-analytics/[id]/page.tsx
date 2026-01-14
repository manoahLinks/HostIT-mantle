"use client";

import React, { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { GoDotFill } from "react-icons/go";
import { useParams, useRouter } from "next/navigation";
import TicketPoap from "@/components/dashboard/TicketPoap";
import { IoIosShareAlt } from "react-icons/io";
import { Button } from "@/components/ui/button";
import GooMap from "@/components/map";
import { convertDateFormat } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { GiPadlock } from "react-icons/gi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BsFolder } from "react-icons/bs";
import { IoCartOutline } from "react-icons/io5";
import { RiShieldUserLine } from "react-icons/ri";
import { PiBroadcast, PiLineVerticalThin } from "react-icons/pi";
import { PiUploadSimpleThin } from "react-icons/pi";
import { TbMessageOff } from "react-icons/tb";
import MerchCard from "@/components/dashboard/MerchCard";
import { MdMoveToInbox, MdOutlineQrCodeScanner } from "react-icons/md";
import { Input } from "@/components/ui/input";
import { MdAnalytics } from "react-icons/md";
import { LucideImport } from "lucide-react";
import { Event } from "@/lib/eventApi";
import { toast } from "sonner";

const Page = () => {
  const router = useRouter();
  const { id } = useParams();
  const [uploadImage, setUploadImage] = React.useState(true);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch event data from API
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/events/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch event");
        const data = await res.json();
        setCurrentEvent(data.event);
      } catch (err) {
        console.error("Error fetching event:", err);
        toast.error("Failed to load event details");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  return (
    <Tabs defaultValue="details" className="w-full">
      <div className="mx-4 sm:mx-6 lg:mx-8 2xl:mx-12">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-12 w-full">
          {/* Navigation and Tabs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full lg:w-4/5 2xl:w-2/3 gap-4">
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
                <TabsTrigger
                  value="check-in"
                  className="flex gap-1 text-center items-center justify-center text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                >
                  <MdMoveToInbox size={16} className="sm:w-5 sm:h-5" />
                  <span className="sm:inline">Check-In</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Days Counter */}
          <div className="w-full lg:w-1/5 2xl:w-1/3 flex items-center justify-end">
            <p className="text-white font-medium text-sm sm:text-lg 2xl:text-xl py-2 px-4 sm:px-6 rounded-lg border-2 italic">
              14 days to go
            </p>
          </div>
        </div>

        {/* Details Tab Content */}
        <TabsContent value="details" className="min-h-[82vh]">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="flex flex-col items-center gap-4">
                <svg
                  className="animate-spin h-12 w-12 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-white text-lg">Loading event...</p>
              </div>
            </div>
          ) : !currentEvent ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <p className="text-white text-xl">Event not found</p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 my-4">
              {/* Left Column - Event Image and Description */}
              <div className="w-full lg:w-2/3 relative">
                <img
                  src={currentEvent.image ? `https://ipfs.io/ipfs/${currentEvent.image}` : "/event-image.png"}
                  alt="event-image"
                  className="w-full rounded-3xl h-48 sm:h-56 2xl:h-64 object-cover"
                />

                <div className="absolute top-4 left-4 px-3 sm:px-4 py-1 rounded-full font-semibold text-sm sm:text-base z-10 border-2 border-white bg-[#13193980] text-white">
                  {currentEvent.event_category?.toLowerCase() === "free" ? "Free" : "Paid"}
                </div>

                <div className="my-6 sm:my-8 2xl:my-10 border-2 border-subsidiary rounded-full w-full max-w-xs sm:max-w-sm lg:max-w-md 2xl:w-96 flex justify-center items-center h-12 2xl:h-14 mx-auto lg:mx-0">
                  <h1 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent uppercase">
                    Description
                  </h1>
                </div>

                <div
                  className="text-white text-base sm:text-lg 2xl:text-xl leading-relaxed prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentEvent.description || '' }}
                />
              </div>

            {/* Right Column - Event Details */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4 sm:gap-6 mb-14 mb:mb-0">
              {/* Event Title and Date */}
              <div>
                <h1 className="text-xl sm:text-2xl 2xl:text-3xl font-semibold bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent">
                  {currentEvent.name}
                </h1>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center mt-2">
                  <p className="uppercase text-sm sm:text-base 2xl:text-lg text-white">
                    {currentEvent.start_date
                      ? new Date(currentEvent.start_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })
                      : currentEvent.createdAt
                      ? new Date(currentEvent.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })
                      : "TBD"
                    }
                  </p>
                  <GoDotFill className="text-white text-xl hidden sm:block" />
                  <p className="uppercase text-sm sm:text-base 2xl:text-lg text-white">
                    {currentEvent.start_date
                      ? new Date(currentEvent.start_date).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true
                        })
                      : currentEvent.schedule && currentEvent.schedule.length > 0
                      ? currentEvent.schedule[0].start_time
                      : "TBD"
                    }
                  </p>
                </div>
              </div>

              {/* Ticket POAP */}
              <TicketPoap isTicket isAttendee={false} />

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4">
                <div className="bg-subsidiary flex justify-center items-center rounded-full h-12 w-12 sm:h-14 sm:w-14">
                  <IoIosShareAlt
                    className="w-6 h-6 sm:w-7 sm:h-7 2xl:w-[30px] 2xl:h-[30px]"
                    color={"#FFFFFF"}
                  />
                </div>
                <Dialog>
                  <DialogTrigger className="text-sm sm:text-base 2xl:text-lg h-12 2xl:h-14 w-32 sm:w-48 2xl:w-56 rounded-lg bg-subsidiary hover:bg-white hover:text-subsidiary text-white font-semibold">
                    Edit Event
                  </DialogTrigger>
                  <DialogContent className="border bg-principal border-subsidiary rounded-3xl p-0 w-[90%] max-w-md">
                    <div className="p-8 sm:p-12 rounded-t-3xl bg-subsidiary w-full flex justify-center items-center">
                      <GiPadlock
                        color="#ffffff"
                        size={60}
                        className="sm:w-[72px] sm:h-[72px]"
                      />
                    </div>
                    <div className="p-6 sm:p-8 flex flex-col justify-center items-center gap-4">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent text-center">
                        This event has been cancelled
                      </h1>
                      <Button
                        className="text-sm sm:text-base 2xl:text-lg h-12 2xl:h-14 w-44 sm:w-52 font-semibold bg-subsidiary hover:bg-white hover:text-subsidiary rounded-xl"
                        onClick={() => {
                          router.push("/attendee-login");
                        }}
                      >
                        Claim refund
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Map */}
              {/* <div className="flex gap-2 h-32 sm:h-40 lg:h-full"> */}
                <GooMap />
              {/* </div> */}

              {/* POAP */}
              <TicketPoap isTicket={false} isAttendee={false} />

              {/* Revenue Card */}
              <div className="border border-subsidiary py-4 px-4 sm:py-6 sm:px-6 2xl:py-6 2xl:px-10 rounded-2xl flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h1 className="text-lg sm:text-xl 2xl:text-2xl font-bold bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent inline-flex w-auto">
                    Ticket Revenue
                  </h1>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex flex-col justify-center items-center">
                    <h1 className="text-2xl sm:text-3xl 2xl:text-5xl text-white">
                      $2000
                    </h1>
                    <p className="text-white text-sm sm:text-base 2xl:text-lg">
                      Total
                    </p>
                  </div>

                  <PiLineVerticalThin className="text-white text-4xl sm:text-6xl 2xl:text-8xl" />

                  <div className="flex flex-col justify-center items-center">
                    <h1 className="text-2xl sm:text-3xl 2xl:text-5xl text-white">
                      $0
                    </h1>
                    <p className="text-white text-sm sm:text-base 2xl:text-lg">
                      Sold
                    </p>
                  </div>

                  <PiLineVerticalThin className="text-white text-4xl sm:text-6xl 2xl:text-8xl" />

                  <div className="flex flex-col justify-center items-center">
                    <h1 className="text-2xl sm:text-3xl 2xl:text-5xl text-white">
                      $2000
                    </h1>
                    <p className="text-white text-sm sm:text-base 2xl:text-lg">
                      Available
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </TabsContent>

        {/* Live Updates Tab */}
        <TabsContent value="live-updates" className="min-h-[82vh] mb-20 lg:mb-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent inline-flex my-4">
              Media Library
            </h1>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div
                  className={`flex flex-col justify-center items-center rounded-xl h-24 sm:h-32 w-full sm:w-44 lg:w-52 border-subsidiary border cursor-pointer hover:bg-subsidiary ${
                    uploadImage ? "bg-subsidiary" : "bg-transparent"
                  }`}
                  onClick={() => setUploadImage(true)}
                >
                  <h3
                    className={`font-semibold text-sm sm:text-base ${
                      uploadImage
                        ? "text-white"
                        : "bg-transparent bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent"
                    }`}
                  >
                    Uploaded Images
                  </h3>
                  <p className="text-white text-2xl sm:text-4xl">200</p>
                </div>

                <div
                  className={`flex flex-col justify-center items-center rounded-xl h-24 sm:h-32 w-full sm:w-44 lg:w-52 border-subsidiary border cursor-pointer hover:bg-subsidiary ${
                    !uploadImage ? "bg-subsidiary" : "bg-transparent"
                  }`}
                  onClick={() => setUploadImage(false)}
                >
                  <h3
                    className={`font-semibold text-sm sm:text-base ${
                      !uploadImage
                        ? "text-white"
                        : "bg-transparent bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent"
                    }`}
                  >
                    Feedbacks
                  </h3>
                  <p className="text-white text-2xl sm:text-4xl">0</p>
                </div>
              </div>

              <Button
                className="text-sm sm:text-base 2xl:text-lg h-12 2xl:h-14 w-full sm:w-48 lg:w-56 font-semibold rounded-lg bg-subsidiary hover:bg-white hover:text-subsidiary text-white cursor-pointer"
                disabled
              >
                {uploadImage ? "Upload Media" : "Post a Feedback"}
              </Button>
            </div>

            {uploadImage ? (
              <div className="min-h-[400px] sm:min-h-[500px] 2xl:min-h-[50vh] flex flex-col gap-6 sm:gap-10 justify-center items-center px-4">
                <div className="flex flex-col gap-6 sm:gap-10 justify-center items-center mt-6 max-w-2xl">
                  <ul className="flex flex-col gap-2 text-white text-sm sm:text-base">
                    <li className="flex items-start gap-2">
                      <GoDotFill className="mt-1 flex-shrink-0" />
                      Upload clear, high-quality images (no blurry or low-light
                      shots).
                    </li>
                    <li className="flex items-start gap-2">
                      <GoDotFill className="mt-1 flex-shrink-0" />
                      Showcase key moments: speakers, crowds, performances, and
                      highlights.
                    </li>
                    <li className="flex items-start gap-2">
                      <GoDotFill className="mt-1 flex-shrink-0" />
                      Use real-time photos that reflect the true vibe of the
                      event.
                    </li>
                    <li className="flex items-start gap-2">
                      <GoDotFill className="mt-1 flex-shrink-0" />
                      Formats supported: JPG, PNG. Max size: 10MB per image.
                    </li>
                  </ul>

                  <div className="flex flex-col p-4 sm:p-6 border border-dashed border-subsidiary rounded-2xl justify-center items-center w-full max-w-md sm:max-w-lg h-64 sm:h-80">
                    <PiUploadSimpleThin
                      size={60}
                      className="sm:w-20 sm:h-20"
                      color="#ffffff"
                    />
                    <h1 className="text-lg sm:text-2xl font-semibold bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent inline-flex my-4 text-center">
                      Upload Media
                    </h1>
                    <Button
                      className="text-sm sm:text-base 2xl:text-lg h-12 2xl:h-14 w-full max-w-56 font-semibold rounded-lg bg-subsidiary hover:bg-white hover:text-subsidiary text-white cursor-pointer"
                      disabled
                    >
                      Upload
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="min-h-[300px] sm:min-h-[430px] 2xl:min-h-[50vh] flex flex-col gap-6 sm:gap-10 justify-center items-center">
                <div className="flex flex-col justify-center items-center">
                  <TbMessageOff
                    size={100}
                    className="sm:w-[150px] sm:h-[150px]"
                  />
                  <p className="text-white text-lg sm:text-xl">
                    No feedbacks yet
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Merch Tab */}
        <TabsContent value="merch" className="min-h-[82vh] mb-20 lg:mb-0">
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8">
              <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent inline-flex my-4">
                Merchandise
              </h1>

              <Dialog>
                <DialogTrigger className="text-sm sm:text-base 2xl:text-lg h-12 2xl:h-14 w-full sm:w-48 2xl:w-56 rounded-lg bg-subsidiary hover:bg-white hover:text-subsidiary text-white font-semibold">
                  Add Merch
                </DialogTrigger>
                <DialogContent className="border bg-principal border-subsidiary rounded-3xl p-0 w-[90%] max-w-md">
                  <div className="p-8 sm:p-12 rounded-t-3xl bg-subsidiary w-full flex justify-center items-center">
                    <GiPadlock
                      color="#ffffff"
                      size={60}
                      className="sm:w-[72px] sm:h-[72px]"
                    />
                  </div>
                  <div className="p-6 sm:p-8 flex flex-col justify-center items-center gap-4">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent text-center">
                      This event has been cancelled
                    </h1>
                    <Button
                      className="text-sm sm:text-base 2xl:text-lg h-12 2xl:h-14 w-44 sm:w-52 font-semibold bg-subsidiary hover:bg-white hover:text-subsidiary rounded-xl"
                      onClick={() => {
                        router.push("/attendee-login");
                      }}
                    >
                      Claim refund
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              <div className="w-full">
                <MerchCard isOrganizer />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Role Tab */}
        <TabsContent value="role" className="min-h-[82vh] mb-20 lg:mb-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent inline-flex my-4">
              Assign Role
            </h1>

            <div className="border border-white rounded-3xl flex flex-col lg:flex-row gap-6 lg:gap-10 w-full py-6 px-4 sm:py-7 sm:px-7">
              <div className="w-full lg:w-3/5 flex flex-col gap-4 sm:gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <h1 className="text-xl sm:text-2xl font-bold text-white">
                    Grant Access
                  </h1>
                  <h4 className="text-white font-medium text-base sm:text-lg 2xl:text-xl underline underline-offset-4 flex items-center gap-2 hover:cursor-pointer">
                    IMPORT CSV. <LucideImport size={20} />
                  </h4>
                </div>

                <ul className="flex flex-col gap-2 text-white">
                  <li className="flex items-start gap-2 text-xs sm:text-sm">
                    <GoDotFill className="mt-1 flex-shrink-0" />
                    Import a CSV file containing attendee details (e.g. name,
                    email, wallet address) to bulk assign access.
                  </li>
                  <li className="flex items-start gap-2 text-xs sm:text-sm">
                    <GoDotFill className="mt-1 flex-shrink-0" />
                    Manually assign access by entering a verified wallet address
                    linked to the attendee.
                  </li>
                  <li className="flex items-start gap-2 text-xs sm:text-sm">
                    <GoDotFill className="mt-1 flex-shrink-0" />
                    Update or revoke access at any time through the admin
                    dashboard.
                  </li>
                </ul>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Enter attendee's email address"
                    className="w-full sm:w-3/4 h-12 px-4 sm:px-10"
                  />
                  <Button
                    className="w-full sm:w-1/4 py-4 bg-subsidiary h-12 hover:bg-white hover:text-subsidiary"
                    disabled
                  >
                    Assign
                  </Button>
                </div>
              </div>

              <div className="w-full lg:w-2/5 flex flex-col text-white px-1 sm:px-8 border-t-2 lg:border-t-0 lg:border-l-2 pt-6 lg:pt-0 justify-between gap-4">
                <div className="flex items-center gap-2">
                  <p className="text-lg text-white font-bold">Revoke Access</p>
                </div>
                <div className="flex flex-col gap-5">
                  <Input
                    placeholder="Enter attendee's email address"
                    className="w-full h-12 px-4 sm:px-10"
                  />
                  <Button className="w-full bg-subsidiary text-white font-bold h-12 hover:bg-white hover:text-subsidiary">
                    Revoke
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Check-in Tab */}
        <TabsContent value="check-in" className="min-h-[82vh] mb-10 lg:mb-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent inline-flex my-4">
              Check Attendee In
            </h1>

            <div className="border border-white rounded-3xl flex flex-col lg:flex-row gap-6 lg:gap-10 w-full py-6 px-4 sm:py-7 sm:px-7">
              <div className="w-full lg:w-3/5 flex flex-col gap-4 sm:gap-6">
                <div className="flex justify-between items-start">
                  <h1 className="text-xl sm:text-2xl font-bold text-white">
                    CHECKIN
                  </h1>
                  <MdOutlineQrCodeScanner
                    size={32}
                    className="sm:w-10 sm:h-10"
                  />
                </div>

                <ul className="flex flex-col gap-2 text-white">
                  <li className="flex items-start gap-2 text-xs sm:text-sm">
                    <GoDotFill className="mt-1 flex-shrink-0" />
                    Search by attendee email address or scan their QR code to
                    locate their ticket
                  </li>
                  <li className="flex items-start gap-2 text-xs sm:text-sm">
                    <GoDotFill className="mt-1 flex-shrink-0" />
                    Check in attendee and wait for on-chain confirmation.
                  </li>
                </ul>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Enter attendee's email address"
                    className="w-full sm:w-3/4 h-12 px-4 sm:px-10"
                  />
                  <Button
                    className="w-full sm:w-1/4 py-4 bg-subsidiary h-12 hover:bg-white hover:text-subsidiary"
                    disabled
                  >
                    Search
                  </Button>
                </div>
              </div>

              <div className="w-full lg:w-2/5 flex flex-col justify-between py-6 px-4 sm:px-8 rounded-xl bg-subsidiary text-white">
                <div className="flex items-center gap-2">
                  <MdAnalytics size={20} />
                  <p className="text-lg text-white">TRACKER</p>
                </div>
                <div className="flex justify-between mt-4">
                  <div className="flex flex-col items-start">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white">
                      1500
                    </h1>
                    <p className="text-xs">Registered</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white">
                      0
                    </h1>
                    <p className="text-xs">Verified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center sm:justify-end mt-6">
            <h4 className="text-white font-medium text-base sm:text-lg 2xl:text-xl underline text-center sm:text-left flex items-center gap-3 underline-offset-4 hover:cursor-pointer hover:text-subsidiary">
              CHECK VERIFIED LIST <LucideImport size={20} />
            </h4>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default Page;
