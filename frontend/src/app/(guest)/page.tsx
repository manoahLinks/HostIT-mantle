"use client";

import FeaturesSection from "@/components/landing-page/FeaturesSection";
import HeroSection from "@/components/landing-page/HeroSection";
import ReviewSection from "@/components/landing-page/ReviewSection";
import ScrollSection from "@/components/landing-page/ScrollSection";
import Footer from "@/components/shared-components/Footer";
import Header from "@/components/shared-components/Header";
import { motion } from "framer-motion";
import React from "react";

const page = () => {
  return (
    <div className="mx-auto space-y-8">
      <Header />
      <HeroSection />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="flex md:hidden"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="shadow-2xl w-full h-auto"
          width="390"
          height="844"
          poster="/mobile-hostitgif-poster.jpg"
        >
          <source src="/mobile-hostitgif.webm" type="video/webm" />
          <source src="/mobile-hostitgif.mp4" type="video/mp4" />
          {/* Fallback to GIF for browsers that don't support video */}
          <img
            src="/mobile-hostitgif.gif"
            alt="HostIt app demo on mobile"
            width="390"
            height="844"
          />
        </video>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="max-w-[1280px] mx-auto hidden md:flex"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="mr-10 clip-path shadow-2xl w-full h-auto"
          style={{
            clipPath: "inset(30px 0px 60px 70px)",
          }}
          width="1280"
          height="720"
          poster="/hostitgif-poster.jpg"
        >
          <source src="/hostitgif.webm" type="video/webm" />
          <source src="/hostitgif.mp4" type="video/mp4" />
          {/* Fallback to GIF for browsers that don't support video */}
          <img
            src="/hostitgif.gif"
            alt="HostIt app demo on desktop"
            width="1280"
            height="720"
            className="mr-10 clip-path shadow-2xl"
            style={{
              clipPath: "inset(30px 0px 60px 70px)",
            }}
          />
        </video>
      </motion.div>
      <FeaturesSection />
      <ReviewSection />
      <ScrollSection />
      <Footer />
    </div>
  );
};

export default page;