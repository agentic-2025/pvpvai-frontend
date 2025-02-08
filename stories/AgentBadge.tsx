"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { FC } from "react";
import { AgentAvatar } from "./AgentAvatar";
import { PlayerAddressChip } from "./PlayerAddressChip";

interface AgentBadgeProps {
  id: number;
  name: string;
  color: string;
  borderColor?: string;
  variant?: "xs" | "sm" | "md";
  avatar?: string;
  creatorAddress: string;
  popularity?: number;
  additionalIcons?: string[];
}

type AvatarVariant = "xs" | "sm" | "md" | "lg";

const variantStyles = {
  xs: {
    maxChars: 8,
    padding: "pl-1.5 pr-2 py-0.5",
    text: "text-xs",
    avatar: "xs" as AvatarVariant,
    gap: "gap-1",
  },
  sm: {
    maxChars: 10,
    padding: "pl-2 pr-2.5 py-0.5",
    text: "text-sm",
    avatar: "xs" as AvatarVariant,
    gap: "gap-1.5",
  },
  md: {
    maxChars: 16,
    padding: "pl-2.5 pr-3 py-1",
    text: "text-base",
    avatar: "sm" as AvatarVariant,
    gap: "gap-2",
  },
};

export const AgentBadge: FC<AgentBadgeProps> = ({
  id,
  name,
  color,
  borderColor,
  variant = "md",
  avatar,
  creatorAddress,
  popularity = 0,
  additionalIcons = [],
}) => {
  const styles = variantStyles[variant];
  const displayName =
    name.length > styles.maxChars
      ? `${name.slice(0, styles.maxChars)}...`
      : name;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {(() => {
            const content = (
              <div
                className={cn(
                  "rounded-full font-medium transition-colors inline-flex items-center",
                  styles.padding,
                  styles.text,
                  styles.gap,
                  id !== 0 && "group-hover:underline"
                )}
                style={{
                  backgroundColor: color,
                  color: isLightColor(color) ? "black" : "white",
                }}
              >
                {avatar && (
                  <AgentAvatar
                    name={name}
                    borderColor={borderColor || color}
                    imageUrl={avatar}
                    variant={styles.avatar}
                    disableLink={true}
                  />
                )}
                {displayName}
              </div>
            );

            return id === 0 ? (
              content
            ) : (
              <Link href={`/agent/${id}`} className="group">
                {content}
              </Link>
            );
          })()}
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="p-4 bg-gray-800 border-gray-700"
        >
          <div className="flex gap-4">
            <AgentAvatar
              name={name}
              borderColor={borderColor || color}
              imageUrl={avatar}
              variant="lg"
              disableLink={true}
            />
            <div className="flex flex-col gap-2">
              <div className="text-lg font-medium text-gray-200">{name}</div>
              {creatorAddress && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Created by</span>
                  <PlayerAddressChip address={creatorAddress} variant="small" />
                </div>
              )}
              <div className="text-sm text-gray-400">
                Popularity: {popularity}
              </div>
              {additionalIcons && additionalIcons.length > 0 && (
                <div className="flex gap-1">
                  {additionalIcons.map((icon, index) => (
                    <img
                      key={index}
                      src={icon}
                      alt="icon"
                      className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Helper function to determine if a color is light or dark
function isLightColor(color: string): boolean {
  // Remove any leading #
  const hex = color.replace("#", "");

  // Convert hex to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate perceived brightness using the formula:
  // (R * 299 + G * 587 + B * 114) / 1000
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Return true if the color is light (brightness > 128)
  return brightness > 128;
}
