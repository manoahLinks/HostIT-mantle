import React, { useState } from "react";
import ReviewCard from "./ReviewCard";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ReviewCardMobile from "./ReviewCardMobile";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
type Props = {};

const reviews = [
  {
    id: 1,
    image: "/ayo.png",
    name: "Awosika Ayodeji",
    review:
      "Using HostIt to host Web3 Lagos conference was a smooth experience. The team made integrations easy by providing technical support and handling the hosting by themselves. The post-event data was also very good.",
    role: "Founder / Web3bridge",
  },
  {
    id: 2,
    image: "/aguda.png",
    name: "Aguda Toluwani",
    review:
      "HostIt made our event management seamless and stress-free. The platform is intuitive, and the support team is always available to assist.",
    role: "Co-founder, Web3 Unilag",
  },
  {
    id: 3,
    image: "/karla.png",
    name: "Karlagod.eth",
    review:
      "HostIt made registration and check-in at our Borderless event seamless and efficient. Their on-ground support and POAP integration were exceptional.",
    role: "Lead Partner @BorderlessDev",
  },
  {
    id: 4,
    image: "/kene.png",
    name: "Kenechukwu Nweke",
    review:
      "We're thrilled to have partnered with Hostit for Anambra Web3 Community 2024! Their seamless registration and participant management took a huge burden off our team. We're excited to partner again for 2025!",
    role: "Co-founder, Anambra Techies",
  },
  {
    id: 5,
    image: "/hkay.png",
    name: "Hezekiah Suleman",
    review:
      "HostIt made the Ife Tech Community Event seamless. I loved the real-time analytics—it provided instant insights. Registration and check-in were effortless, and the team's support was excellent.",
    role: "Markets Manager @CryptoAPIs",
  },
];

const settings = {
  dots: false,
  infinite: true,
  className: "center",
  speed: 2000,
  slidesToShow: 1,
  arrows: false,
  autoplay: true,
  autoplaySpeed: 5000,
  centerPadding: "10px", 
  centerMode: true, 
};

const ReviewSection = (props: Props) => {
  const [openCardId, setOpenCardId] = useState<number>(1); // Default to the first card being open

  const toggleCard = (id: number) => {
    if (openCardId === id) return;
    setOpenCardId(id);
  };

  const { ref, inView } = useInView({
    threshold: 0.2, // adjust the threshold as needed
  });

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="flex flex-col gap-14 max-w-[1280px] mx-auto px-4"
    >
      <div className="flex justify-center">
        <h4 className="px-8 py-2 rounded-full border border-subsidiary bg-gradient-to-r from-[#007CFA] from-30% to-white to-80% bg-clip-text font-semibold text-transparent">
          Reviews
        </h4>
      </div>
      <div className="flex flex-col lg:flex-row justify-center gap-6 lg:h-[500px] items-center">
        <div className="gap-6 flex flex-col w-full text-center lg:text-left lg:w-[456px]">
          <h1 className="text-wrap bg-gradient-to-r from-[#007CFA] from-30% to-white to-80% bg-clip-text text-transparent text-4xl md:text-5xl font-semibold leading-tight">
            Join other People who love HostIt
          </h1>
          <p className="text-lg mx-auto">
            Discover why event organizers and attendees alike are raving about
            HostIt. Read their reviews and see how our platform has transformed
            their event management experience with seamless, secure, and
            innovative solutions.
          </p>
        </div>
        <div className="md:flex gap-2 hidden">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              id={review.id}
              image={review.image}
              name={review.name}
              review={review.review}
              role={review.role}
              isOpen={openCardId === review.id}
              toggleOpen={() => toggleCard(review.id)}
            />
          ))}
        </div>
        <div className="slider-container md:hidden w-full">
          <Slider {...settings}>
            {reviews.map((review) => (
              <ReviewCardMobile
                key={review.id}
                image={review.image}
                name={review.name}
                review={review.review}
                role={review.role}
              />
            ))}
          </Slider>
        </div>
      </div>
    </motion.div>
  );
};

export default ReviewSection;