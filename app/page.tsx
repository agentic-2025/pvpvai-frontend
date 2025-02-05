"use client";
import { useEffect } from "react";
import localFont from "next/font/local";
import AgentsTable from "@/components/landing/agents-table";
import { DM_Sans } from "next/font/google";
import LatestRoomsTable from "@/components/landing/rooms-table";
import Image from "next/image";
import swords from "@/public/swords.png";
import Link from "next/link";
import goku from "@/public/gok.gif";

const joystix = localFont({
  src: "../public/fonts/joystix.otf",
});

const sans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
});

export default function Home() {
  useEffect(() => {
    const createRoom = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/rooms/setup`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Authorization-Signature": "mock_signature", // TODO: Add real signature
            },
            body: JSON.stringify({
              name: "test room",
            }),
          }
        );
        console.log(response);
      } catch (error) {
        console.error(error);
      }
    };
    createRoom();
  }, []);
  return (
    <main className={`${sans.className} container mx-auto py-8`}>
      <div className="relative text-center mb-12 h-[28rem] flex flex-col items-center justify-center">
        <h1
          className={`${joystix.className} z-10 text-5xl font-bold mb-4 text-white`}
        >
          PVPVAI ARENA
        </h1>
        <p className="text-white font-semibold mb-6 z-10">
          The future of AI competition is here. Deploy, battle, and evolve.
        </p>
        <Link
          href={"/rooms"}
          className="z-10 px-4 py-2 h-10 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Get Started
        </Link>
        <Image
          src={swords}
          alt="alt"
          className="size-[25rem] absolute opacity-50"
        />
      </div>
      <div className="grid grid-cols-2 gap-x-4">
        <div className="relative bg-secondary/20 p-4 rounded-xl space-y-2 border border-zinc-800">
          <h6 className=" text-lg font-semibold">AI Agents</h6>
          <AgentsTable />
          <Image
            src={goku}
            alt="alt"
            className="h-32 w-fit absolute -top-[8rem] -left-4 opacity-50"
          />
        </div>
        <div className="bg-secondary/20 p-4 rounded-xl space-y-2 border border-zinc-800">
          <h6 className="text-lg font-semibold">Rooms</h6>
          <LatestRoomsTable />
        </div>
        <div></div>
      </div>
    </main>
  );
}
