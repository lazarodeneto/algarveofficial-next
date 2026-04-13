/**
 * components/ui/form/SelectField.tsx
 *
 * Controlled select field with sentinel-value handling.
 *
 * CONTRACT:
 *  - The stored form value is `string | undefined` (NOT "none" / "all" / "").
 *  - Internally, `denormalizeSelect` maps undefined → sentinel so shadcn/ui
 *    <Select> always has a defined `value` (stays controlled).
 *  - On change, `normalizeSelect` converts sentinel → undefined before
 *    calling `onValueChange`.
 *
 * NEVER do:  value={data.owner_id === undefined ? "none" : data.owner_id}
 * ALWAYS use this component (or the normalizeSelect / denormalizeSelect utils).
 *
 * Usage with react-hook-form:
 *   <FormField control={form.control} name="city_id" render={({ field }) => (
 *     <SelectField
 *       label="City"
 *       value={field.value}
 *       onValueChange={field.onChange}
 *       required
 *     >
 *       {cities.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
 *     </SelectField>
 *   )} />
 *
 * For optional fields with a "none" sentinel item:
 *   <SelectField label="Region" value={field.value} onValueChange={field.onChange} noneLabel="No region">
 *     {regions.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
 *   </SelectField>
 */

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn }    from "@/lib/utils";
import { normalizeSelect, denormalizeSelect } from "@/lib/forms/normalize";

interface SelectFieldProps {
  label:          string;
  /** The "clean" form value — string | undefined (never a sentinel). */
  value:          string | null | undefined;
  /** Called with the parsed value — string | undefined (never a sentinel). */
  onValueChange:  (value: string | undefined) => void;
  children:       React.ReactNode;
  required?:      boolean;
  hint?:          string;
  error?:         string;
  className?:     string;
  disabled?:      boolean;
  placeholder?:   string;
  id?:            string;
  name?:          string;
  /**
   * Label for the "no selection" item that is injected automatically when
   * provided. Defaults to no injected item.
   */
  noneLabel?:     string;
  /** The internal sentinel string (default: "none"). */
  sentinel?:      string;
}

export function SelectField({
  label,
  value,
  onValueChange,
  children,
  required,
  hint,
  error,
  className,
  disabled,
  placeholder,
  id,
  name,
  noneLabel,
  sentinel = "none",
}: SelectFieldProps) {
  // null | undefined → sentinel so <Select> stays controlled
  const displayValue = denormalizeSelect(value ?? undefined, sentinel);

  const handleChange = (v: string) => {
    onValueChange(normalizeSelect(v, sentinel));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id ?? name}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>

      <Select value={displayValue} onValueChange={handleChange} disabled={disabled}>
        <SelectTrigger id={id ?? name} className={cn(error && "border-destructive")}>
          <SelectValue placeholder={placeholder ?? `Select ${label.toLowerCase()}…`} />
        </SelectTrigger>
        <SelectContent>
          {noneLabel !== undefined && (
            <SelectItem value={sentinel}>{noneLabel}</SelectItem>
          )}
          {children}
        </SelectContent>
      </Select>

      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
