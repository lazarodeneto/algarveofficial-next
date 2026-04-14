import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagInput } from "./TagInput";
import { Badge } from "@/components/ui/badge";
import { SingleImageUploadField } from "./SingleImageUploadField";
import { X } from "lucide-react";
import type { CategoryFieldConfig } from "@/lib/categoryTemplates";
import { cn } from "@/lib/utils";
import { formatNumberInput, safeParseFloat } from "@/lib/forms/parse";

interface DynamicFormFieldProps {
  field: CategoryFieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
}

export function DynamicFormField({
  field,
  value,
  onChange,
  error,
  disabled = false,
}: DynamicFormFieldProps) {
  const renderField = () => {
    switch (field.type) {
      case "text":
        return (
          <Input
            type="text"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={cn(error && "border-destructive")}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={formatNumberInput(value as number | null | undefined)}
            onChange={(e) => onChange(safeParseFloat(e.target.value) ?? undefined)}
            min={field.min}
            max={field.max}
            placeholder={field.placeholder}
            disabled={disabled}
            className={cn(error && "border-destructive")}
          />
        );

      case "textarea":
        return (
          <Textarea
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={cn("min-h-[100px]", error && "border-destructive")}
          />
        );

      case "select":
        return (
          <Select
            value={(value as string) ?? ""}
            onValueChange={onChange}
            disabled={disabled}
          >
            <SelectTrigger className={cn(error && "border-destructive")}>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}...`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "multiselect": {
        const selectedValues = (value as string[]) ?? [];
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-md border border-input bg-background">
              {selectedValues.length === 0 && (
                <span className="text-sm text-muted-foreground">
                  Click options below to select...
                </span>
              )}
              {selectedValues.map((val) => {
                const label = field.options?.find((o) => o.value === val)?.label ?? val;
                return (
                  <Badge key={val} variant="secondary" className="gap-1 px-2 py-1">
                    {label}
                    <button
                      type="button"
                      onClick={() => onChange(selectedValues.filter((v) => v !== val))}
                      className="ml-1 hover:text-destructive"
                      disabled={disabled}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              {field.options
                ?.filter((opt) => !selectedValues.includes(opt.value))
                .map((option) => (
                  <Badge
                    key={option.value}
                    variant="outline"
                    className="cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => {
                      if (!disabled) {
                        onChange([...selectedValues, option.value]);
                      }
                    }}
                  >
                    + {option.label}
                  </Badge>
                ))}
            </div>
          </div>
        );
      }

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={(value as boolean) ?? false}
              onCheckedChange={onChange}
              disabled={disabled}
            />
            <label
              htmlFor={field.name}
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Enable this option
            </label>
          </div>
        );

      case "tags":
        return (
          <TagInput
            value={(value as string[]) ?? []}
            onChange={onChange}
            placeholder={field.placeholder}
            disabled={disabled}
          />
        );

      case "image":
        return (
          <SingleImageUploadField
            value={(value as string) ?? ""}
            onChange={(url) => onChange(url)}
            disabled={disabled}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name} className="flex items-center gap-2">
        {field.label}
        {field.required && <span className="text-destructive">*</span>}
      </Label>
      {renderField()}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
