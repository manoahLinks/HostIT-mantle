import React from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import Image from 'next/image';

type Props = {
    image: string;
    name: string;
    review: string;
    role: string;
  };

const ReviewCardMobile = ({image, name, review, role}: Props) => {
  return (
          <Card
            className={`w-80 my-4 border border-subsidiary py-5 bg-subsidiary h-[500px] relative flex justify-center items-center flex-col mx-2`}
          >
            <Image
              src={image}
              width={110}
              height={110}
              className={`rounded-full`}
              alt={`${name} profile photo`}
              loading="lazy"
            />
            <CardHeader
              className={`text-2xl font-semibold text-transparent text-white text-center`}
            >
              {name}
            </CardHeader>
            <CardContent className="text-white text-center text-lg px-4">
              {review}
            </CardContent>
            <CardFooter
              className={`text-white text-center text-xl font-medium`}
            >
              {role}
            </CardFooter>
          </Card>
     
      
  )
}

export default ReviewCardMobile