import { cn } from "@/lib/utils";
import Image from "next/image";

interface ChainButtonProps {
  disabled?: boolean;
  iconUrl: string;
  selected?: boolean;
  className?: string;
  iconClassName?: string;
  onClick?: () => void;
}

export function ChainButton({
  disabled,
  iconUrl,
  selected = false,
  className,
  iconClassName,
  onClick,
}: ChainButtonProps) {
  return (
    <div
      className={cn(
        "relative p-1.5 rounded-lg",
        selected && "border-[3px] border-primary"
      )}
    >
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "flex items-center justify-center rounded-lg px-6 py-4 transition-all",
          "hover:opacity-80 active:opacity-70",
          className
        )}
      >
        <div className={cn("relative", iconClassName)}>
          <Image src={iconUrl} alt="Chain" fill className="object-contain" />
        </div>
      </button>
    </div>
  );
}
