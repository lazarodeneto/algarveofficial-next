/**
 * components/ui/form/SwitchField.tsx
 *
 * Controlled boolean switch / toggle with label and description.
 *
 * CONTRACT:
 *  - The stored form value is `boolean`.
 *  - `value` defaults to `false` when null/undefined so the Switch is
 *    always controlled.
 *
 * Usage with react-hook-form:
 *   <FormField control={form.control} name="is_curated" render={({ field }) => (
 *     <SwitchField
 *       label="Curated"
 *       description="Appears in curated editorial collections"
 *       checked={field.value}
 *       onCheckedChange={field.onChange}
 *     />
 *   )} />
 *
 * Usage standalone:
 *   <SwitchField
 *     label="No Index"
 *     description="Prevent search engines from indexing this page"
 *     checked={data.no_index}
 *     onCheckedChange={(v) => onChange("no_index", v)}
 *   />
 */

import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { Label }  from "@/components/ui/label";
import { cn }     from "@/lib/utils";

interface SwitchFieldProps {
  label:            string;
  /** Additional explanatory text shown below the label */
  description?:     string;
  /** The boolean value — null/undefined treated as false */
  checked:          boolean | null | undefined;
  onCheckedChange:  (value: boolean) => void;
  required?:        boolean;
  hint?:            string;
  error?:           string;
  className?:       string;
  disabled?:        boolean;
  id?:              string;
  name?:            string;
}

export function SwitchField({
  label,
  description,
  checked,
  onCheckedChange,
  required,
  hint,
  error,
  className,
  disabled,
  id,
  name,
}: SwitchFieldProps) {
  const fieldId    = id ?? name ?? label.toLowerCase().replace(/\s+/g, "-");
  // null/undefined → false so Switch is always controlled
  const safeChecked = checked ?? false;

  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="space-y-0.5 flex-1">
        <Label htmlFor={fieldId} className="cursor-pointer">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
        {!error && hint && (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
      </div>

      <Switch
        id={fieldId}
        checked={safeChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="shrink-0 mt-0.5"
      />
    </div>
  );
}
