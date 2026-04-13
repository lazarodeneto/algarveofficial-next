/**
 * components/ui/form/NumberField.tsx
 *
 * Controlled numeric input field.
 *
 * CONTRACT:
 *  - The stored form value is `number | null` (NOT a string).
 *  - The <input> always receives a string via `formatNumberInput` so React
 *    stays controlled even when the value is null.
 *  - On change, `safeParseFloat` / `safeParseInt` converts the raw string
 *    back to `number | null` before calling `onValueChange`.
 *
 * NEVER do:  onChange={(e) => onChange(Number(e.target.value))}
 *   — that turns "" into 0, and "abc" into NaN.
 * ALWAYS use this component (or the safe parse utils) instead.
 *
 * Usage with react-hook-form:
 *   <FormField control={form.control} name="lat" render={({ field }) => (
 *     <NumberField
 *       label="Latitude"
 *       value={field.value}
 *       onValueChange={field.onChange}
 *       step="any"
 *       min={-90}
 *       max={90}
 *     />
 *   )} />
 */

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn }    from "@/lib/utils";
import { safeParseFloat, safeParseInt, formatNumberInput } from "@/lib/forms/parse";

interface NumberFieldProps {
  label:          string;
  /** The numeric value (or null when empty). */
  value:          number | null | undefined;
  /** Called with the parsed number, or null when the input is empty/invalid. */
  onValueChange:  (value: number | null) => void;
  required?:      boolean;
  hint?:          string;
  error?:         string;
  className?:     string;
  disabled?:      boolean;
  placeholder?:   string;
  id?:            string;
  name?:          string;
  /** Input step attribute. "any" allows decimals. */
  step?:          number | "any";
  min?:           number;
  max?:           number;
  /** Parse integers instead of floats (default: false) */
  integer?:       boolean;
  onBlur?:        () => void;
}

export function NumberField({
  label,
  value,
  onValueChange,
  required,
  hint,
  error,
  className,
  disabled,
  placeholder,
  id,
  name,
  step,
  min,
  max,
  integer = false,
  onBlur,
}: NumberFieldProps) {
  // Display value: null/undefined → "" so input stays controlled
  const displayValue = formatNumberInput(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsed = integer
      ? safeParseInt(raw)
      : safeParseFloat(raw);
    onValueChange(parsed);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id ?? name}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>

      <Input
        id={id ?? name}
        name={name}
        type="number"
        value={displayValue}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        step={step}
        min={min}
        max={max}
        className={cn(error && "border-destructive")}
      />

      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
