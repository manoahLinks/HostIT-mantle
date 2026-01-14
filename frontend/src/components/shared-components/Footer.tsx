import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import { BsSendFill } from "react-icons/bs";
import { Input } from "../ui/input";
import { FaTelegramPlane } from "react-icons/fa";
import { FaSquareFacebook } from "react-icons/fa6";
import { RiInstagramFill } from "react-icons/ri";
import { FaYoutube } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { AiFillCopyrightCircle } from "react-icons/ai";
import { GoDotFill } from "react-icons/go";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

const Footer = () => {
  return (
    <div className="max-w-[1280px] mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mx-2 my-2 gap-5 ">
        <div className="md:w-1/3">
          <Image
            src="/logo.png"
            alt="HostIt logo - Event management platform"
            width={149}
            height={25}
            loading="lazy"
          />
        </div>
        <Dialog>
          <div className="flex gap-8 items-center w-full md:w-1/3 justify-center">
            <DialogTrigger className="text-text hover:text-subsidiary">
              Events
            </DialogTrigger>
            <GoDotFill size={16} color={"#C8C8C8"} />
            <DialogTrigger className="text-text hover:text-subsidiary">
              Launch App
            </DialogTrigger>
            <DialogContent className="bg-principal border-subsidiary">
              <DialogHeader className="flex flex-col gap-6">
                <DialogTitle className="text-3xl text-center bg-gradient-to-r from-[#007CFA] from-30% to-white to-90% bg-clip-text text-transparent">
                  Big things are brewing! <br />
                  Our next launch is coming soon.
                  <br />
                  Watch this space!
                </DialogTitle>
                <DialogDescription className="text-text text-center text-xl flex flex-col gap-6">
                  Follow us on our socials to stay updated
                  <div className="flex gap-4 justify-center">
                    <a
                      href="https://t.me/hostitevents"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaTelegramPlane size={30} color={"#C8C8C8"} />
                    </a>
                    <a
                      href="https://www.instagram.com/hostitevents/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <RiInstagramFill size={30} color={"#C8C8C8"} />
                    </a>
                    <a
                      href="https://www.youtube.com/@hostitevents"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {" "}
                      <FaYoutube size={30} color={"#C8C8C8"} />
                    </a>
                    <a
                      href="https://x.com/hostit_events"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {" "}
                      <FaSquareXTwitter size={30} color={"#C8C8C8"} />
                    </a>
                  </div>
                  <div className="mt-4 flex flex-col items-center gap-4">
                    <p className="text-text text-xl">
                      Do you want to host an event? Request our services 👇
                    </p>
                    <a
                      href="https://calendly.com/fullstackchat/30min"
                      target="_blank"
                    >
                      <Button className="flex items-center justify-center gap-2 text-white text-lg bg-subsidiary p-6 mx-auto">
                        Request Our Services
                      </Button>
                    </a>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </div>
        </Dialog>
        <div className="w-full md:w-1/3">
          <div className="border rounded-md border-text flex gap-3 bg-transparent text-text justify-between items-center">
            <Input
              type="text"
              placeholder="Enter email to subsribe to our newsletter"
              className="border-none bg-transparent px-2 text-text"
            />
            <Button className="text-white bg-subsidiary hover:bg-subsidiary m-2">
              <BsSendFill size={16} />
            </Button>
          </div>
        </div>
      </div>
      <hr className="w-full h-0.5 border-slate-400 my-5" />
      <div className="flex flex-col gap-4 md:flex-row justify-between items-center mx-2 my-6">
        <div className="flex gap-2">
          <AiFillCopyrightCircle size={24} color={"#C8C8C8"} />
          <p className="text-text">All Rights Reserved, HostIt 2025.</p>
        </div>
        <div className="flex gap-4">
          <a
            href="https://t.me/hostitevents"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTelegramPlane size={24} color={"#C8C8C8"} />
          </a>
          <a
            href="https://www.instagram.com/hostitevents/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaSquareFacebook size={24} color={"#C8C8C8"} />
          </a>
          <a
            href="https://www.instagram.com/hostitevents/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <RiInstagramFill size={24} color={"#C8C8C8"} />
          </a>
          <a
            href="https://www.youtube.com/@hostitevents"
            target="_blank"
            rel="noopener noreferrer"
          >
            {" "}
            <FaYoutube size={24} color={"#C8C8C8"} />
          </a>
          <a
            href="https://x.com/hostit_events"
            target="_blank"
            rel="noopener noreferrer"
          >
            {" "}
            <FaSquareXTwitter size={24} color={"#C8C8C8"} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Footer;
