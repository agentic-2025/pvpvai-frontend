"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import logo from "@/public/logo.svg";
import LoginButton from "@/components/privy-login-button";

export interface NavItem {
  href: string;
  label: string;
  activeClass?: string;
  inactiveClass?: string;
}

export interface NavbarProps {
  className?: string;
  navItems?: NavItem[];
}

export function Navbar({ className, navItems }: NavbarProps) {
  const pathname = usePathname();

  // Define default active and inactive classes.
  const defaultActiveClass = "bg-primary text-primary-foreground hover:text-primary-foreground/80 px-3 py-1 rounded-md";
  const defaultInactiveClass = "text-muted-foreground";

  // Default nav items if not provided, with default active/inactive classes.
  const defaultNavItems: NavItem[] = [
    {
      href: "/rooms",
      label: "Rooms",
      activeClass: defaultActiveClass,
      inactiveClass: defaultInactiveClass,
    },
    {
      href: "/agents",
      label: "Agents",
      activeClass: defaultActiveClass,
      inactiveClass: defaultInactiveClass,
    },
  ];

  // Use provided navItems or fallback to defaults
  const items = navItems || defaultNavItems;

  return (
    <nav className={cn("border-b", className)}>
      <div className="container mx-auto flex h-16 items-center gap-x-10">
        <Link href="/" className="flex items-center">
          <Image
            src={logo.src}
            alt="Autonome"
            width={500}
            height={500}
            className="h-6 w-fit"
          />
        </Link>
        <div className="flex items-center gap-4 ml-8">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-base font-thin transition-colors hover:text-white/70",
                pathname === item.href
                  ? item.activeClass || defaultActiveClass
                  : item.inactiveClass || defaultInactiveClass
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="ml-auto pr-4">
          <LoginButton />
        </div>
      </div>
    </nav>
  );
}
