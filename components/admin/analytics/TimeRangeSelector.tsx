import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type TimeRange = "7d" | "30d" | "90d" | "custom";

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

const timeRangeLabels: Record<TimeRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "custom": "Custom range",
};

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="glass-button-outline h-11 justify-between gap-2 rounded-full border-border/60 bg-background/35 px-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.35)] sm:min-w-[12rem]"
        >
          <Calendar className="h-4 w-4" />
          <span className="flex-1 text-left">{timeRangeLabels[value]}</span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-box border-border/50 bg-card/80">
        <DropdownMenuItem onClick={() => onChange("7d")}>
          Last 7 days
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange("30d")}>
          Last 30 days
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange("90d")}>
          Last 90 days
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
