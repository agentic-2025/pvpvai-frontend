import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AgentAvatarProps {
  id?: number;
  name: string;
  borderColor: string;
  imageUrl?: string;
  variant?: "lg" | "md" | "sm" | "xs" | "xxs";
  className?: string;
}

const variantStyles = {
  lg: {
    size: "size-36",
    border: "border-4",
    text: "text-[3rem]",
  },
  md: {
    size: "size-24",
    border: "border-4",
    text: "text-[1.5rem]",
  },
  sm: {
    size: "size-12",
    border: "border-2",
    text: "text-[0.75rem]",
  },
  xs: {
    size: "size-8",
    border: "border-2",
    text: "text-[0.5rem]",
  },
  xxs: {
    size: "size-4",
    border: "border",
    text: "text-[0.25rem]",
  },
};

export function AgentAvatar({
  id,
  name,
  borderColor,
  imageUrl,
  variant = "lg",
  className,
}: AgentAvatarProps) {
  const styles = variantStyles[variant];

  return (
    <Link href={`/agents/${id ? id : ""}`}>
      <Avatar
        className={cn(styles.size, styles.border, "relative", className)}
        style={{ borderColor }}
      >
        {imageUrl && <AvatarImage src={imageUrl} alt={name} />}
        <AvatarFallback
          className={cn(styles.text, "rounded-full text-white bg-gray-700")}
        >
          {name?.slice(0, 2)?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </Link>
  );
}
