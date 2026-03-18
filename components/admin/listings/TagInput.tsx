import { useState, KeyboardEvent, forwardRef } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxTags?: number;
}

export const TagInput = forwardRef<HTMLDivElement, TagInputProps>(
  (
    {
      value = [],
      onChange,
      placeholder = "Type and press Enter...",
      disabled = false,
      className,
      maxTags = 20,
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addTag();
      } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
        removeTag(value.length - 1);
      }
    };

    const addTag = () => {
      const tag = inputValue.trim();
      if (tag && !value.includes(tag) && value.length < maxTags) {
        onChange([...value, tag]);
        setInputValue("");
      }
    };

    const removeTag = (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-wrap gap-2 p-2 rounded-md border border-input bg-background min-h-[42px]",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        {value.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="gap-1 px-2 py-1 text-sm"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-1 hover:text-destructive focus:outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={value.length === 0 ? placeholder : ""}
          disabled={disabled || value.length >= maxTags}
          className="flex-1 min-w-[120px] border-0 p-0 h-auto focus-visible:ring-0 bg-transparent"
        />
      </div>
    );
  }
);

TagInput.displayName = "TagInput";
