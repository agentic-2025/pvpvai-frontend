"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
// TODO replace with our logo
import logo from "./assets/ai/chatgpt.svg";
import LoginButton from "@/components/privy-login-button";

export interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("border-b", className)}>
      <div className="container mx-auto flex h-16 items-center">
        <Link href="/" className="flex items-center border-2">
          <Image src={logo.src} alt="Autonome" width={40} height={40} />
        </Link>
        <div className="flex items-center gap-4 ml-8">
          <Link
            href="/rooms"
            className={cn(
              "text-lg font-medium transition-colors hover:text-primary",
              pathname === "/rooms"
                ? "text-primary underline underline-offset-4"
                : "text-muted-foreground"
            )}
          >
            Rooms
          </Link>
          <Link
            href="/agents"
            className={cn(
              "text-lg font-medium transition-colors hover:text-primary",
              pathname === "/agents"
                ? "text-primary underline underline-offset-4"
                : "text-muted-foreground"
            )}
          >
            Agents
          </Link>
        </div>
        <div className="ml-auto pr-4">
          <LoginButton />
        </div>
      </div>
    </nav>
  );
}
