"use client";
import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import { BsFillRocketTakeoffFill } from "react-icons/bs";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
  return (
    <div className="flex justify-between items-center border border-subsidiary rounded-[35px] max-w-[892px] md:mx-auto mx-4 py-3 md:py-4 px-5 md:px-10 mt-5 md:mt-10">
      <Link href={"/"}>
        <Image
          src={"/logo.png"}
          width={149}
          height={47}
          alt="HostIt logo - Event management platform"
          className="hidden md:flex"
          priority
        />
        <Image
          src={"/mobile-logo.png"}
          width={30}
          height={30}
          alt="HostIt logo - Event management platform"
          className="flex md:hidden"
          priority
        />
      </Link>
      <Button
        onClick={() => {
          router.push("/explore");
        }}
        className="flex items-center gap-2 text-white md:text-lg bg-subsidiary px-4 md:px-6 py-2 md:py-6 rounded-lg hover:bg-black"
      >
        Launch dApp <BsFillRocketTakeoffFill />
      </Button>
    </div>
  );
};

export default Header;