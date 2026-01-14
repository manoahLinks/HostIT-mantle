"use client";

import EventCard from "@/components/dashboard/EventCard";
import React, { useEffect, useState } from "react";
import Pagination from "../../../../components/dashboard/Pagination";
import { Event } from "@/lib/eventApi";

type Props = {};

const Page = (props: Props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage, setEventsPerPage] = useState(6);
  const [is2XL, setIs2XL] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Fix hydration errors by ensuring client-only rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch events from API - called once on mount
  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts

    const loadEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const res = await fetch("/api/events", {
          cache: "no-store",
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`);
        const data = await res.json();

        if (isMounted) {
          setEvents(data.events ?? []);
        }
      } catch (err) {
        if (isMounted) {
          if (err instanceof Error) {
            if (err.name === 'AbortError') {
              setError("Request timed out. Please check your connection.");
            } else {
              setError(err.message || "Failed to load events");
            }
          } else {
            setError("Failed to load events");
          }
          console.error("Error fetching events:", err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadEvents();

    return () => {
      isMounted = false; // Cleanup on unmount
    };
  }, []); // Empty dependency array - runs only once on mount

  // Handle responsive screen size changes
  useEffect(() => {
    const checkScreenSize = () => {
      const is2XLScreen = window.innerWidth >= 1536;
      const newEventsPerPage = is2XLScreen ? 8 : 6;

      // Only update state if values actually changed to avoid unnecessary re-renders
      setIs2XL(prev => (prev !== is2XLScreen ? is2XLScreen : prev));
      setEventsPerPage(prev => (prev !== newEventsPerPage ? newEventsPerPage : prev));
    };

    checkScreenSize();

    // Debounce resize to avoid excessive calculations during window dragging
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkScreenSize, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);


  useEffect(() => {
    const newTotalPages = Math.ceil(events.length / eventsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  }, [eventsPerPage, events.length, currentPage]);

  const totalPages = Math.ceil(events.length / eventsPerPage);

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Helper function to format date
  const formatDate = (event: any) => {
    // Try start_date first (if exists)
    if (event.start_date) {
      const date = new Date(event.start_date);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    // Fallback to createdAt
    if (event.createdAt) {
      const date = new Date(event.createdAt);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    return "TBD";
  };

  // Helper function to format time
  const formatTime = (event: any) => {
    // Try start_date first
    if (event.start_date) {
      const date = new Date(event.start_date);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });
    }
    // Check schedule array
    if (event.schedule && event.schedule.length > 0 && event.schedule[0].start_time) {
      return event.schedule[0].start_time;
    }
    return "TBD";
  };

  // Check if event is free
  const isFreeEvent = (event: any) => {
    // Check event_category first (database field)
    if (event.event_category?.toLowerCase() === 'free') return true;
    // Fallback to ticket_types if available
    return event.ticket_types?.some((ticket: any) => ticket.price === 0) ?? false;
  };

  // Prevent hydration errors - don't render until client is ready
  if (!isClient) {
    return (
      <div className="pb-16 relative min-h-[82vh] px-4 sm:px-6 md:px-8 xl:px-10 2xl:px-12">
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
            <p className="text-white text-lg">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16 relative min-h-[82vh] px-4 sm:px-6 md:px-8 xl:px-10 2xl:px-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 mb-6">
        <div className="w-full sm:w-auto flex justify-end">
          <p className="text-white font-medium border-2 italic text-sm sm:text-base md:text-lg 2xl:text-xl py-2 px-4 rounded-lg">
            Event Counter: {isLoading ? "..." : events.length}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
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
            <p className="text-white text-lg">Loading events...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center max-w-md">
            <p className="text-red-400 text-lg font-semibold mb-2">Error Loading Events</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && events.length === 0 && (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <p className="text-white text-xl font-semibold mb-2">No Events Found</p>
            <p className="text-white/60 text-sm">Create your first event to get started!</p>
          </div>
        </div>
      )}

      {/* Events Grid */}
      {!isLoading && !error && events.length > 0 && (
        <>
          <div className="flex flex-wrap gap-4 sm:gap-6 md:gap-4 lg:gap-[1.3%]">
            {currentEvents.map((event) => (
              <div
                key={event._id}
                className="w-full sm:w-[48%] md:w-[31%] 2xl:w-[24%] mb-6"
              >
                <EventCard
                  isFree={isFreeEvent(event)}
                  date={formatDate(event)}
                  time={formatTime(event)}
                  location={event.location}
                  name={event.name}
                  description={event.description}
                  id={event._id}
                  image={event.image ? `https://ipfs.io/ipfs/${event.image}` : undefined}
                />
              </div>
            ))}
          </div>

          {/* Pagination at bottom center */}
          <div className="w-full flex justify-center mt-8 md:absolute md:bottom-4 md:right-0 md:justify-end pr-4 md:pr-8 2xl:pr-16">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
