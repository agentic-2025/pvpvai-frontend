import { Label } from "./label";
import { Input } from "./input";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  className?: string;
  generateRandomColor?: () => void;
}

export function ColorPicker({
  label,
  value,
  onChange,
  className,
  generateRandomColor,
}: ColorPickerProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <div
              className="w-10 h-10 rounded-md border border-border cursor-pointer"
              style={{ backgroundColor: value }}
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3 bg-popover border-border">
            <HexColorPicker color={value} onChange={onChange} />
          </PopoverContent>
        </Popover>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 font-mono bg-muted border-border"
        />
        {generateRandomColor && (
          <button
            onClick={generateRandomColor}
            className="px-2 py-1 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
          >
            Random
          </button>
        )}
      </div>
    </div>
  );
}
