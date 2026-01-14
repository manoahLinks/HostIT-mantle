import FeaturesCard from "./FeaturesCard";
import { HiCurrencyDollar } from "react-icons/hi2";
import { FaAward } from "react-icons/fa6";
import { IoTicket } from "react-icons/io5";
import { MdAnalytics } from "react-icons/md";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const FeaturesSection = () => {
  const featuresData = [
    {
      header: "Escrow-Backed Transactions.",
      body: "Ensure event organizers are held accountable with funds securely stored in escrow, only released when the event happens. If not, attendees get automatic refunds—no fuss, no middlemen.",
      icon: (
        <HiCurrencyDollar
          size={50}
          className="text-subsidiary group-hover:text-white -ml-8 -mt-8 -rotate-45"
        />
      ),
    },
    {
      header: "Earn Digital Collectibles-POAPs.",
      body: "Earn unique, blockchain-backed POAP badges for attending events. These digital collectibles serve as lasting mementos, securely stored and verifiable on the blockchain!",
      icon: (
        <FaAward
          size={50}
          className="text-subsidiary group-hover:text-white -ml-8 -mt-8 -rotate-45"
        />
      ),
    },
    {
      header: "Effortless Event Management.",
      body: "Easily manage ticket sales, attendee tracking, and event logistics all in one secure, decentralized platform. Focus on your event, and let HostIt handle the rest!",
      icon: (
        <IoTicket
          size={50}
          className="text-subsidiary group-hover:text-white -ml-8 -mt-8 -rotate-90"
        />
      ),
    },
    {
      header: "Real-Time Event Analytics",
      body: "Organizers can track ticket sales, attendance, and more, all in real-time with complete transparency and security, ensuring a smooth event experience from start to finish.",
      icon: (
        <MdAnalytics
          size={50}
          className="text-subsidiary group-hover:text-white -ml-8 -mt-8 -rotate-45"
        />
      ),
    },
  ];
  
  const { ref, inView } = useInView({
    threshold: 0.2,
  });

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div ref={ref} className="flex flex-col gap-2 px-4">
      <div className="flex justify-center ">
        <h4 className="px-8 py-2 rounded-full border border-subsidiary bg-gradient-to-r from-[#007CFA] from-30% to-white to-80% bg-clip-text font-semibold  text-transparent">
          FEATURES
        </h4>
      </div>
      <h1 className="text-center text-wrap bg-gradient-to-r from-[#007CFA] from-30% to-white to-80% bg-clip-text text-transparent text-4xl md:text-6xl md:leading-relaxed font-semibold md:font-normal">
        Why We Stand Out
      </h1>
      <p className="text-lg text-center mx-auto max-w-[360px]">
        Effortless ticketing, seamless verification—HostIT takes care of the
        details, so you can focus on unforgettable events.
      </p>

      <motion.div
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={variants}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="max-w-[1280px] mx-auto flex gap-4 flex-grow flex-wrap items-center justify-center"
      >
        {featuresData.map(({ header, body, icon }, index) => {
          return (
            <FeaturesCard key={index} header={header} body={body} icon={icon} />
          );
        })}
      </motion.div>
    </div>
  );
};

export default FeaturesSection;