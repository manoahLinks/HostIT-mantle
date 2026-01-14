import React from "react";
import { Button } from "../ui/button";
import { motion } from "framer-motion"; 
import { BsFillRocketTakeoffFill } from "react-icons/bs";
import { useRouter } from "next/navigation";

const HeroSection = () => {
  const router = useRouter();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const childVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div
      className="h-[50vh] mx-auto max-w-[715px] flex flex-col items-center justify-center text-center gap-6 px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1
        className="text-center text-wrap bg-gradient-to-r from-[#007CFA] from-30% to-white to-95% bg-clip-text text-transparent text-4xl font-semibold md:text-6xl md:font-semibold"
        variants={childVariants}
      >
        Your Event, Your Rules—We Handle the Rest.
      </motion.h1>

      <motion.p
        className="text-lg md:text-xl mx-auto max-w-[408px]"
        variants={childVariants}
      >
        HostIt simplifies ticketing and verification, so you can focus on
        creating experiences. Let’s build something amazing.
      </motion.p>

      <motion.div
        variants={childVariants}
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }} 
      >
          <Button className="flex items-center justify-center gap-2 text-white text-base md:text-lg bg-subsidiary p-6 mx-auto rounded-xl"  onClick={() => {
          router.push("/explore");
        }}>
            Launch dApp <BsFillRocketTakeoffFill />
          </Button>
      </motion.div>
    </motion.div>
  );
};

export default HeroSection;
