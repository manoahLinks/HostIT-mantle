"use client";

import Slider from "react-slick";
import React from "react";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

type Props = {};

const ScrollSection = (props: Props) => {
  const scrollText = ["Events made easy", "HostIt", "Create Events", "HostIt"];

  const settings = {
    dots: false,
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    speed: 5000,
    autoplaySpeed: 2000,
    cssEase: "linear",
    arrows: false,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };

  const content = scrollText.map((text, index) => {
    return (
      <div key={index}>
        <div className="flex gap-2 md:gap-12  justify-center items-center">
          <Image
            src="/scrolling-star.png"
            alt="star decoration"
            width={31}
            height={31}
            loading="lazy"
          />
          <h1 className="text-white font-semibold text-base lg:text-2xl 2xl:text-3xl">
            {text}
          </h1>
        </div>
      </div>
    );
  });

  return (
    <Slider {...settings} className="flex gap-6 py-4 bg-subsidiary/70">
      {content}
    </Slider>
  );
};

export default ScrollSection;
