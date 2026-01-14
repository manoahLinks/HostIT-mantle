import React from "react";
import { FaLocationDot } from "react-icons/fa6";
import { usePathname, useRouter } from "next/navigation";

type Props = {
  isFree?: boolean;
  date?: string;
  time?: string;
  location?: string;
  description?: string;
  name?: string;
  id?: string | number;
  image?: string;
};

const EventCard = ({
  isFree,
  date,
  time,
  location,
  name,
  description,
  id,
  image,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      className="border border-subsidiary bg-subsidiary w-full rounded-[20px] h-[420px] my-2 relative group overflow-hidden hover:cursor-pointer"
      onClick={() => {
        switch (pathname) {
          case "/dashboard/attendee/explore":
            router.push(`/dashboard/attendee/explore/${id}`);
            break;
          case "/dashboard/attendee/my-events":
            router.push(`/dashboard/attendee/my-events/${id}`);
            break;
          case "/dashboard/organizer/event-analytics":
            router.push(`/dashboard/organizer/event-analytics/${id}`);
            break;
          default:
            router.push(`/explore/${id}`);
            break;
        }
      }}
    >
      {typeof isFree !== "undefined" && (
        <div className="absolute top-4 right-4 px-4 py-1 rounded-full font-semibold text-base z-1 border-2 border-white bg-[#13193980] text-white">
          {isFree ? "Free" : "Paid"}
        </div>
      )}

      {/* Image that disappears on hover */}
      <div className="w-full h-[60%] transition-opacity duration-500 ease-in-out group-hover:opacity-0">
        <img
          src={image ?? "/event-image.png"}
          alt="event image"
          className="w-full rounded-t-[20px] h-full rounded-bl-[80px] object-cover"
        />
      </div>

      {/* Event details that appear on hover */}
      <div
        className="absolute top-0 left-0 w-full h-[60%] flex flex-col items-center justify-center 
                     bg-subsidiary rounded-t-[20px] rounded-bl-[80px] opacity-0 
                     transition-opacity duration-500 ease-in-out group-hover:opacity-100"
      >
        <p className="text-white text-4xl font-bold">{date}</p>
        <p className="text-white text-xl font-medium mt-2">{time}</p>
        <p className="text-white text-lg font-medium mt-2 text-center px-4 flex items-baseline">
          <FaLocationDot size={20} className="mr-2" /> {location}
        </p>
      </div>

      <div className="px-8 py-4 flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-white Aeonik-bold line-clamp-1">
          {name}
        </h1>
        <p className="text-white text-base line-clamp-3">
          {description ? description.replace(/<[^>]*>/g, '').trim() : ''}
        </p>
      </div>
    </div>
  );
};

export default EventCard;
