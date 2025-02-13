import { cn } from "@/lib/utils";
import Image from "next/image";

interface NetworkButtonProps {
  iconUrl: string;
  selected?: boolean;
  className?: string;
  iconClassName?: string;
  onClick?: () => void;
}

export function NetworkButton({
  iconUrl,
  selected = false,
  className,
  iconClassName,
  onClick,
}: NetworkButtonProps) {
  return (
    <div
      className={cn(
        "relative p-1.5 rounded-lg",
        selected && "border-[3px] border-primary"
      )}
    >
      <button
        onClick={onClick}
        className={cn(
          "flex items-center justify-center rounded-lg px-6 py-4 transition-all",
          "hover:opacity-80 active:opacity-70",
          className
        )}
      >
        <div className={cn("relative", iconClassName)}>
          <Image src={iconUrl} alt="Network" fill className="object-contain" />
        </div>
      </button>
    </div>
  );
}
