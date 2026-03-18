import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          {timeRangeLabels[value]}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
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
