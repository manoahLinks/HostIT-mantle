import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import Image from "next/image";

type Props = {
  id: number;
  image: string;
  name: string;
  review: string;
  role: string;
  isOpen: boolean;
  toggleOpen: () => void;
};



const ReviewCard = ({
  id,
  image,
  name,
  review,
  role,
  isOpen,
  toggleOpen,
}: Props) => {
  return (
    <Card
      className={`w-80 my-4 border border-subsidiary py-5 bg-subsidiary group h-[500px] relative flex justify-center items-center flex-col transition-all duration-500 ease-in-out ${
        isOpen ? "" : "w-28 flex-row"
      }`}
      onClick={toggleOpen}
    >
      {isOpen ? (
        <>
          <Image
            src={image}
            width={110}
            height={110}
            className={`rounded-full transition-all duration-500 ease-in-out ${
              !isOpen ? "opacity-0" : "opacity-100"
            }`}
            alt={`${name} profile photo`}
            loading="lazy"
          />
          <CardHeader
            className={`text-2xl font-semibold text-transparent text-white text-center ${
              isOpen ? "" : "-rotate-90"
            }`}
          >
            {name}
          </CardHeader>
          <CardContent className="text-white text-center text-lg px-4">
            {review}
          </CardContent>
          <CardFooter
            className={`text-white text-center text-xl font-medium ${
              isOpen ? "" : "-rotate-90"
            }`}
          >
            {role}
          </CardFooter>
        </>
      ) : (
        <div className="flex flex-col -rotate-90">
          <p
            className={`text-2xl font-semibold text-transparent text-white text-center w-[500px]`}
          >
            {name}
          </p>
          <p className={`text-white text-center text-xl font-medium`}>{role}</p>
        </div>
      )}
    </Card>
  );
};

export default ReviewCard;

