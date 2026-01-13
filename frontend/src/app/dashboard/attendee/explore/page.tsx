"use client";

import EventCard from "@/components/dashboard/EventCard";
import React, { useEffect, useState } from "react";
import Pagination from "../../../../components/dashboard/Pagination";
import { toast } from "sonner";
import Link from "next/link";
import { MdEventBusy } from "react-icons/md";
import { BsStars } from "react-icons/bs";
import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core";

const Page = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage, setEventsPerPage] = useState(6);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isLoggedIn = useIsLoggedIn();

  // Adjust events per page based on screen width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1536) setEventsPerPage(8); // 2xl
      else if (width >= 1024) setEventsPerPage(6); // lg
      else if (width >= 768) setEventsPerPage(4); // md (tablet)
      else setEventsPerPage(2); // sm (mobile)
    };

    handleResize(); // run on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Avoid page overflow when events per page change
  useEffect(() => {
    const newTotalPages = Math.ceil(events.length / eventsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  }, [eventsPerPage, events.length, currentPage]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();
        console.log(data)
        setEvents(data.events ?? []);
      } catch (err: any) {
        toast.error(err.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const totalPages = Math.ceil(events.length / eventsPerPage);
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (!loading && events.length === 0) {
    return (
      <div className="pb-24 relative min-h-[82vh] px-4 sm:px-6 md:px-8 lg:px-12 2xl:px-16 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 w-24 h-24 rounded-full bg-[#131939] border border-subsidiary flex items-center justify-center shadow-[0_0_40px_#131939]">
            <MdEventBusy size={38} className="text-white" />
          </div>
          <h2 className="text-white text-2xl font-semibold Aeonik-bold flex items-center justify-center gap-2">
            No events available <BsStars className="text-indigo-300" />
          </h2>
          <p className="text-white/70 text-sm mt-2">
            {isLoggedIn ? "Be the first to create one." : "Login to create your event."}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/dashboard/organizer/create-event" className="inline-flex">
              <button className="px-4 py-2 rounded-full bg-white text-black font-medium hover:opacity-90 transition">
                Create an event
              </button>
            </Link>
            {!isLoggedIn && (
              <Link href="/organizer-login" className="inline-flex">
                <button className="px-4 py-2 rounded-full border border-white text-white font-medium hover:bg-white/10 transition">
                  Organizer login
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 relative min-h-[82vh] px-4 sm:px-6 md:px-8 lg:px-12 2xl:px-16">
      {/* Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 mb-3">
        {currentEvents.map((event) => (
          <EventCard
            key={event._id ?? event.id}
            id={event._id ?? event.id}
            isFree={event.isFree}
            date={event.date}
            time={event.time}
            location={event.location}
            name={event.name}
            description={event.description}
            image={event.image && !String(event.image).startsWith("http")
              ? `https://ipfs.io/ipfs/${event.image}`
              : event.image}
          />
        ))}
      </div>

      {/* Responsive Pagination */}
      {totalPages > 1 && (
        <div className="md:absolute md:bottom-4 w-full flex justify-center pr-4 md:pr-8 2xl:pr-16">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default Page;